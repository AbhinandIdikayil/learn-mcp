import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = new McpServer({
    name: 'My MCP Server',
    description: 'A simple MCP server implemented in TypeScript',
    version: '1.0.0',
})


server.registerTool('create-user',
    {
        description: 'Create a user',
        inputSchema: z.object({
            name: z.string(),
            email: z.string().email(),
        }),
        annotations:{
            readOnlyHint: false,
            destructiveHint: false,
            idempotentHint: false,
            openWorldHint: true
        }
    },
    async ({ email, name }) => {
        try {
            const id = await createUser(name, email);
            return {
                content: [
                    { type: 'text', text: `User  ${id} created successfully: ${name} (${email})` }
                ]
            }

        } catch(error) {
            console.error("Error creating user:", error);
            return {
                content: [
                    { type: 'text', text: `Error creating user` }
                ]
            }
        }
    }
)

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Weather MCP Server running on stdio");
}


const createUser = async (name: string, email: string) => {
    const filePath = path.join(__dirname, 'data', 'user.json');
    const raw = await fs.readFile(filePath, 'utf-8');
    const users = JSON.parse(raw);
    const id = users.length + 1;
    users.push({ id, name, email });
    await fs.writeFile(filePath, JSON.stringify(users, null, 2));
    return id;
}

main().catch((err) => {
    console.error("Error starting MCP Server:", err);
});
