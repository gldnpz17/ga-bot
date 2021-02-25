# bacod-bot
A simple LINE bot server application.

Official Account ID : @450ykrnr

# How to use
## Adding a configuration
### Regex-based message replies
This command makes the bot reply with 'Pong' everytime you type 'Ping'(case-insensitive).
```
@BacodBot add-configuration
{
  "configName":"ping-pong",
  "regex":"/^Ping$/i",
  "reply":"Pong"
}
```

### Scheduled messages
This command makes the bot send 'Beep' every minute.
```
@BacodBot add-configuration
{
  "configName":"beep-config",
  "cronExpression":"* * * * *",
  "reply":"beep"
}
```

This command is also used to update a configuration. Simply use the same configName.

## Listing configurations
Gets the list of configurations.
```
@BacodBot list-configurations
```

## Removing configurations
Removes a configuration.
```
@BacodBot remove-configuration my_configuration_name
```

