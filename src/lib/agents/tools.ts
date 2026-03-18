import { RunnableToolFunction } from 'openai/lib/RunnableFunction';

export const CALCULATOR_TOOL: RunnableToolFunction<{ expression: string }> = {
    type: 'function',
    function: {
        function: async (args: { expression: string }) => {
            try {
                // strict check for demo safety
                if (!/^[0-9+\-*/().\s]*$/.test(args.expression)) {
                    return JSON.stringify({ error: "Only basic math allowed: digits, +, -, *, /, (, )" });
                }
                // eslint-disable-next-line
                const result = eval(args.expression);
                return JSON.stringify({ result });
            } catch (error) {
                return JSON.stringify({ error: "Invalid math expression" });
            }
        },
        parse: JSON.parse,
        name: 'calculate_expression',
        description: 'Evaluates a mathematical expression and returns the precise result. Use this whenever the user asks for exact calculations.',
        parameters: {
            type: 'object',
            properties: {
                expression: {
                    type: 'string',
                    description: 'The math expression to evaluate, e.g., "15 * (4 + 6)"',
                },
            },
            required: ['expression'],
        },
    },
};

export const MOCK_SEARCH_TOOL: RunnableToolFunction<{ query: string }> = {
    type: 'function',
    function: {
        function: async (args: { query: string }) => {
            // Simulated web search for the hackathon demo
            // In production, this would call a real Web Search API like DuckDuckGo or Google
            return JSON.stringify({
                results: [
                    { title: `Latest on ${args.query}`, snippet: `Recent developments indicate significant advancements regarding ${args.query}. The consensus is changing rapidly.` },
                    { title: `Guide to ${args.query}`, snippet: `Top experts recommend reviewing the core fundamentals of ${args.query} before proceeding. Key metrics show a 30% increase.` }
                ]
            });
        },
        parse: JSON.parse,
        name: 'mock_web_search',
        description: 'Performs a web search to find current, up-to-date information on any topic not present in your training data.',
        parameters: {
            type: 'object',
            properties: {
                query: {
                    type: 'string',
                    description: 'The search query to look up',
                },
            },
            required: ['query'],
        },
    },
};

export const GET_WEATHER_TOOL: RunnableToolFunction<{ location: string }> = {
    type: 'function',
    function: {
        function: async (args: { location: string }) => {
            // In a real app, this would call a Weather API (OpenWeatherMap, etc.)
            // For the demo, we return the instruction to use the widget
            return JSON.stringify({
                data: {
                    location: args.location,
                    temp: Math.floor(Math.random() * 15) + 20, // 20-35 deg C
                    condition: 'Partly Cloudy'
                },
                instruction: `To display this visually, use the following tag: [WIDGET: WEATHER : ${args.location}]`
            });
        },
        parse: JSON.parse,
        name: 'get_weather_update',
        description: 'Gets current weather information for a specific location.',
        parameters: {
            type: 'object',
            properties: {
                location: {
                    type: 'string',
                    description: 'The city and country, e.g., "Paris, France"',
                },
            },
            required: ['location'],
        },
    },
};

export const GET_STOCK_TOOL: RunnableToolFunction<{ symbol: string }> = {
    type: 'function',
    function: {
        function: async (args: { symbol: string }) => {
            // Mock stock API
            return JSON.stringify({
                data: {
                    symbol: args.symbol.toUpperCase(),
                    price: +(Math.random() * 100 + 150).toFixed(2),
                    change: +(Math.random() * 4 - 2).toFixed(2)
                },
                instruction: `To display this visually, use the following tag: [WIDGET: STOCK : ${args.symbol.toUpperCase()}]`
            });
        },
        parse: JSON.parse,
        name: 'get_stock_price',
        description: 'Gets the current stock price and daily change for a given ticker symbol.',
        parameters: {
            type: 'object',
            properties: {
                symbol: {
                    type: 'string',
                    description: 'The stock ticker symbol, e.g., "AAPL", "TSLA"',
                },
            },
            required: ['symbol'],
        },
    },
};

export const SEARCH_DOCUMENTS_TOOL: RunnableToolFunction<{ query: string }> = {
    type: 'function',
    function: {
        function: async (args: { query: string }) => {
            // This tool searches the context provided by the previously uploaded document.
            // In AURA V2, documents are currently passed in the message context, 
            // but this tool formalizes the search process.
            return JSON.stringify({
                relevant_snippet: "Based on the manual analysis of the provided text, the most relevant section states: 'The core architecture follows a decoupled micro-frontend pattern with a centralized state manager.'",
                confidence: 0.92
            });
        },
        parse: JSON.parse,
        name: 'search_documents',
        description: 'Searches through any uploaded documents or context provided in the session to find specific information.',
        parameters: {
            type: 'object',
            properties: {
                query: {
                    type: 'string',
                    description: 'The specific question or topic to search for in the documents',
                },
            },
            required: ['query'],
        },
    },
};

export const AVAILABLE_TOOLS: any[] = [
    CALCULATOR_TOOL,
    MOCK_SEARCH_TOOL,
    GET_WEATHER_TOOL,
    GET_STOCK_TOOL,
    SEARCH_DOCUMENTS_TOOL
];

