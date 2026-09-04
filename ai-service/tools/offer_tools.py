CREATE_OFFER_TOOL = {
    "type": "function",
    "function": {
        "name": "create_offer",
        "description": (
            "Create a draft business offer for a customer "
            "using one or more products and quantities. "
            "Use this when the user explicitly asks "
            "to create or generate an offer."
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "customerName": {
                    "type": "string",
                    "description": "Customer name"
                },
                "customerEmail": {
                    "type": "string",
                    "description": "Optional customer email"
                },
                "items": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "productId": {
                                "type": "string"
                            },
                            "quantity": {
                                "type": "integer",
                                "minimum": 1
                            }
                        },
                        "required": [
                            "productId",
                            "quantity"
                        ]
                    }
                }
            },
            "required": [
                "customerName",
                "items"
            ]
        }
    }
}