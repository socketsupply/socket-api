
# Bluetooth

Provides a high level api over bluetooth
A pub-sub of key-value pairs


## constructor

Creates a new service with key-value pairs

| Argument | Type | Default | Required | Description |
| :---     | :--- | :---:   | :---:    | :---        |
| serviceId | string | undefined | true | Required - The id of the service (must be a valid UUID) |

## subscribe

Start scanning for published values that correspond to a well-known UUID

| Argument | Type | Default | Required | Description |
| :---     | :--- | :---:   | :---:    | :---        |
| id | string | undefined | false | A valid UUID to subscribe to |

## publish

Start advertising a new value for a well-known UUID

| Argument | Type | Default | Required | Description |
| :---     | :--- | :---:   | :---:    | :---        |
| characteristicId | string | undefined | false | This item is undocumented. Using it is unadvised. |
| value | string | undefined | false | This item is undocumented. Using it is unadvised. |
