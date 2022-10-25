const line = require('@line/bot-sdk');
const ApplicationError = require('../common/application-error');
const config = require('../config');
const bodyParser = require('body-parser')

class Event {
  constructor(timestamp, groupChatId) {
    this.type = null
    this.timestamp = timestamp
    this.groupChatId = groupChatId
  }
}

class MessageEvent extends Event { // Replyable
  constructor(timestamp, groupChatId, userId, messageId, replyToken, messagingService) {
    super(timestamp, groupChatId)
    this.messageId = messageId
    this.replyToken = replyToken
    this.messagingService = messagingService
    this.reply = messagingService.reply
    this.userId = userId
  }
}

class BlobMessageEvent extends MessageEvent {
  constructor(timestamp, groupChatId, userId, messageId, replyToken, messagingService) {
    super(timestamp, groupChatId, userId, messageId, replyToken, messagingService)
  }

  async downloadBlob() {

  }
}

class TextMessageEvent extends MessageEvent {
  constructor(timestamp, groupChatId, userId, messageId, replyToken, messagingService, text) {
    super(timestamp, groupChatId, userId, messageId, replyToken, messagingService)
    this.type = 'textMessage'
    this.text = text
  }
}

class CommandEvent extends MessageEvent {
  constructor(timestamp, groupChatId, userId, messageId, replyToken, messagingService, command) {
    super(timestamp, groupChatId, userId, messageId, replyToken, messagingService)
    this.type = 'command'
    this.command = command
  }

  isCommand(commands) {
    if (Array.isArray(commands)) {
      return commands.some(command => command === this.command.name)
    } else {
      return commands === this.command.name
    }
  }
}

class ImageMessageEvent extends BlobMessageEvent {
  constructor(timestamp, groupChatId, userId, messageId, replyToken, messagingService) {
    super(timestamp, groupChatId, userId, messageId, replyToken, messagingService)
    this.type = 'imageMessage'
  }
}

class VideoMessageEvent extends BlobMessageEvent {
  constructor(timestamp, groupChatId, userId, messageId, replyToken, messagingService) {
    super(timestamp, groupChatId, userId, messageId, replyToken, messagingService)
    this.type = 'videoMessage'
  }
}

class AudioMessageEvent extends BlobMessageEvent {
  constructor(timestamp, groupChatId, userId, messageId, replyToken, messagingService) {
    super(timestamp, groupChatId, userId, messageId, replyToken, messagingService)
    this.type = 'audioMessage'
  }
}

class FileMessageEvent extends BlobMessageEvent {
  constructor(timestamp, groupChatId, userId, messageId, replyToken, messagingService, filename) {
    super(timestamp, groupChatId, userId, messageId, replyToken, messagingService)
    this.type = 'fileMessage'
    this.filename = filename
  }
}

class UnsendMessageEvent extends Event {
  constructor(timestamp, groupChatId, userId, messageId) {
    super(timestamp, groupChatId, messageId)
    this.type = 'unsend'
    this.userId = userId
  }
}

class JoinEvent extends Event {
  constructor(timestamp, groupChatId, messagingService) {
    super(timestamp, groupChatId)
    this.type = 'join'

    this.reply = messagingService.reply
  }
}

class LeaveEvent extends Event {
  constructor(timestamp, groupChatId) {
    super(timestamp, groupChatId)
    this.type = 'leave'
  }
}

class LineMessagingService {
  constructor(lineConfig, botCustomizationUseCase) {
    this.client = new line.Client(lineConfig)
    this.botCustomization = botCustomizationUseCase
  }

  reply() {
    const messages = []

    const messageFunctions = {
      text(text) {
        messages.push({
          type: 'text',
          text
        })

        return messageFunctions
      },
      image(url) {
        messages.push({
          type: 'image',
          originalContentUrl: url,
          previewImageUrl: url
        })

        return messageFunctions
      },
      async send() {
        await lineClient.replyMessage(replyToken, messages)
      }
    }

    return messageFunctions
  }

  async parseCommand(groupChatId, message) {
    if (new RegExp(`^@(?:(?:${await this.botCustomization.getNickname(groupChatId) ?? config.botName})|(?:${config.botName})) .*`).test(message)) {
      let command = message.match(new RegExp(`^@(?:(?:${await this.botCustomization.getNickname(groupChatId) ?? config.botName})|(?:${config.botName})) (.*?)(\n|$)`))[1];

      let commandComponents = command.split(' ');

      if (commandComponents.length > 0) {
        return {
          name: commandComponents.splice(0, 1)[0],
          args: commandComponents,
          body: (message.indexOf('\n') === -1) ? '' : message.substr(message.indexOf('\n') + 1),
          raw: command
        }
      }
    }

    return null
  }
}

class MockLineMessagingService {
  reply() {
    const messages = []

    const messageFunctions = {
      text(text) {
        messages.push({
          type: 'text',
          text
        })

        return messageFunctions
      },
      image(url) {
        messages.push({
          type: 'image',
          originalContentUrl: url,
          previewImageUrl: url
        })

        return messageFunctions
      },
      async send() {
        console.log('Messages sent!')
        console.log(JSON.stringify(messages))
      }
    }

    return messageFunctions
  }

  async parseCommand(groupChatId, message) {
    if (new RegExp(`^@(?:(?:${config.botName})|(?:${config.botName})) .*`).test(message)) {
      let command = message.match(new RegExp(`^@(?:(?:${config.botName})|(?:${config.botName})) (.*?)(\n|$)`))[1];

      let commandComponents = command.split(' ');

      if (commandComponents.length > 0) {
        return {
          name: commandComponents.splice(0, 1)[0],
          args: commandComponents,
          body: (message.indexOf('\n') === -1) ? '' : message.substr(message.indexOf('\n') + 1),
          raw: command
        }
      }
    }

    return null
  }
}

class LineWebhookHandler {
  constructor(messagingService, lineConfig) {
    this.messagingService = messagingService
    this.lineMiddleware = line.middleware(lineConfig)
  }

  async parseEvent(event) {
    const groupChatId = event.source.groupId
    const userId = event.source.userId
    const timestamp = event.timestamp

    switch(event.type) {
      case 'message': {
        const message = event.message
        const messageId = message.id
        const replyToken = event.replyToken

        const messageEventArgs = [timestamp, groupChatId, userId, messageId, replyToken, this.messagingService]

        switch (message.type) {
          case 'text': {
            const command = await this.messagingService.parseCommand(groupChatId, message.text)

            if (command) {
              return new CommandEvent(...messageEventArgs, command)
            } else {
              return new TextMessageEvent(...messageEventArgs, message.text)
            }
          }
          case 'image': 
            return new ImageMessageEvent(...messageEventArgs)
          case 'audio':
            return new AudioMessageEvent(...messageEventArgs)
          case 'video':
            return new VideoMessageEvent(...messageEventArgs)
          case 'file':
            return new FileMessageEvent(...messageEventArgs, message.filename)
          default:
            throw new ApplicationError('Message type must be "text", "image", "audio", "video", or "file".')
        }
      }
      case 'unsend':
        return new UnsendMessageEvent(timestamp, groupChatId, userId, event.unsend.messageId)
      case 'join':
        return new JoinEvent(timestamp, groupChatId, this.messagingService)
      case 'leave':
        return new LeaveEvent(timestamp, groupChatId)
      default:
        throw new ApplicationError('Event type must be "message", "unsend", "join", or "leave".')
    }
  }

  getMiddlewares() {
    return [
      this.lineMiddleware,
      async (req, _, next) => {
        try {
          req.body.events = await Promise.all(req.body.events.map(this.parseEvent.bind(this)))

          next()
        } catch (err) {
          next(err)
        }
      }
    ]
  }
}

class MockLineWebhookHandler {
  constructor(messagingService) {
    this.messagingService = messagingService
  }

  async parseEvent(event) {
    const groupChatId = event.source.groupId
    const userId = event.source.userId
    const timestamp = event.timestamp

    switch(event.type) {
      case 'message': {
        const message = event.message
        const messageId = message.id
        const replyToken = event.replyToken

        const messageEventArgs = [timestamp, groupChatId, userId, messageId, replyToken, this.messagingService]

        switch (message.type) {
          case 'text': {
            const command = await this.messagingService.parseCommand(null, message.text)

            if (command) {
              return new CommandEvent(...messageEventArgs, command)
            } else {
              return new TextMessageEvent(...messageEventArgs, message.text)
            }
          }
          case 'image': 
            return new ImageMessageEvent(...messageEventArgs)
          case 'audio':
            return new AudioMessageEvent(...messageEventArgs)
          case 'video':
            return new VideoMessageEvent(...messageEventArgs)
          case 'file':
            return new FileMessageEvent(...messageEventArgs, message.filename)
          default:
            throw new ApplicationError('Message type must be "text", "image", "audio", "video", or "file".')
        }
      }
      case 'unsend':
        return new UnsendMessageEvent(timestamp, groupChatId, event.unsend.messageId)
      case 'join':
        return new JoinEvent(timestamp, groupChatId, this.messagingService)
      case 'leave':
        return new LeaveEvent(timestamp, groupChatId)
      default:
        throw new ApplicationError('Event type must be "message", "unsend", "join", or "leave".')
    }
  }

  getMiddlewares() {
    return [
      bodyParser.json(),
      async (req, _, next) => {
        try {
          req.body.events = await Promise.all(req.body.events.map(this.parseEvent.bind(this)))

          next()
        } catch (err) {
          next(err)
        }
      }
    ]
  }
}

module.exports = { 
  LineMessagingService, 
  MockLineMessagingService, 
  LineWebhookHandler,
  MockLineWebhookHandler,
  Event,
  MessageEvent,
  BlobMessageEvent,
  TextMessageEvent,
  CommandEvent,
  ImageMessageEvent,
  VideoMessageEvent,
  AudioMessageEvent,
  FileMessageEvent,
  UnsendMessageEvent,
  JoinEvent,
  LeaveEvent
}