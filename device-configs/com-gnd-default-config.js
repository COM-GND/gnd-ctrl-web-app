
export default {
    "name": "com-gnd-default",
    "bluetooth": {
        "serviceId": "8fc1ceca-b162-4401-9607-c8ac21383e4e",
        "characteristics": {
            "pressureSensor": {
                "id": "c14f18ef-4797-439e-a54f-498ba680291d",
                "type": "float",
                "min": 0.0,
                "max": 10.0,
                "read": true,
                "write": false,
                "notify": true
            },
            "pressureTarget": {
                "id": "34c242f1-8b5f-4d99-8238-4538eb0b5764",
                "type": "float",
                "min": 0.0,
                "max": 10.0,
                "read": true,
                "write": true,
                "notify": true
            },
            "pumpLevel": {
                "id": "d8ad3645-50ad-4f7a-a79d-af0a59469455",
                "type": "float",
                "min": -1.0,
                "max": 1.0,
                "read": true,
                "write": false,
                "notify": true
            }
        }
    }
}