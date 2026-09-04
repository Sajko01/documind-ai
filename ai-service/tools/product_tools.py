SEARCH_PRODUCTS_TOOL = {
    "type": "function",
    "function": {
        "name": "search_products",
        "description": (
            "Search products available in the current "
            "organization. Use this when the user asks "
            "about products, prices, stock, SKU or categories."
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "search": {
                    "type": "string",
                    "description": (
                        "Search term for product name, "
                        "SKU or description."
                    )
                },
                "sku": {
                    "type": "string"
                },
                "category": {
                    "type": "string"
                },
                "minPrice": {
                    "type": "number"
                },
                "maxPrice": {
                    "type": "number"
                },
                "minStock": {
                    "type": "integer"
                },
                "maxStock": {
                    "type": "integer"
                },
                "active": {
                    "type": "boolean"
                },
                "limit": {
                    "type": "integer"
                }
            },
            "required": []
        }
    }
}

GET_PRODUCT_TOOL = {
    "type": "function",
    "function": {
        "name": "get_product",
        "description": (
            "Get complete information about one "
            "specific product using its product ID."
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "id": {
                    "type": "string",
                    "description": "Product UUID"
                }
            },
            "required": [
                "id"
            ]
        }
    }
}

CALCULATE_OFFER_TOOL = {
    "type": "function",
    "function": {
        "name": "calculate_offer",
        "description": (
            "Calculate the total price for a requested "
            "quantity of a specific product. "
            "Use this only when the product ID is known."
        ),
        "parameters": {
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
}