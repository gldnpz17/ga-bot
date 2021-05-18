# ga-bot
A simple LINE bot server application.

Official Account ID : @450ykrnr

# How to use
## Adding a configuration
### Regex-based message replies
This command makes the bot reply with 'Pong' everytime you type 'Ping'(case-insensitive).
```
@GaBot add-configuration
{
  "configName":"ping-pong",
  "regex":"/^Ping$/i",
  "reply":"Pong"
}
```

### Scheduled messages
This command makes the bot send 'Beep' every minute.
```
@GaBot add-configuration
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
@GaBot list-configurations
```

## Removing configurations
Removes a configuration.
```
@GaBot remove-configuration my_configuration_name
```

## Counters
### Initializing a counter
Creates a new counter.
```
@GaBot initialize-counter my_label
OR
@GaBot ic my_label
```

### Increment a counter's value by a certain amount
Increments the given counter's value by a certain amount.
```
@GaBot add-counter my_label 42
OR
@GaBot ac my_label 42
```

### Reset a counter's value
Resets the given counter's value back to 0.
```
@GaBot reset-counter my_label
OR
@GaBot rc my_label
```

### View a counter's current value
Displays the given counter's current value.
```
@GaBot view-counter my_label
OR
@GaBot vc my_label 420
```

### View a counter's history
Displays the given counter's change history.
```
@GaBot history-counter my_label
OR
@GaBot hc my_label 420
```
