# bacod-bot
A simple LINE bot server application that replies to a message that matches a given regex.

Official Account ID : @450ykrnr

# How to use
## Adding a configuration
This command makes the bot reply with 'Pong' everytime you type 'Ping'(case-insensitive).
```
@BacodBot add-configuration
{
  "configName":"hello-world",
  "regex":"/^Ping$/i",
  "reply":"Pong"
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
