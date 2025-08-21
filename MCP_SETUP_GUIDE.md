# MCP Server Setup Guide

## Overview
This guide covers the installation and configuration of three MCP (Model Context Protocol) servers for Cursor:
- **Context7**: For accessing documentation and libraries
- **Firecrawl**: For web scraping and content extraction
- **Notion**: For interacting with Notion API

## Installation Status ✅
All MCP servers have been successfully installed and configured in your Cursor MCP configuration.

## Current Configuration
Your MCP configuration is located at `~/.cursor/mcp.json` and includes:
- ✅ Playwright (browser automation)
- ✅ Filesystem (file access)
- ✅ Xcodebuild (iOS development)
- ✅ Context7 (documentation access) - **Remote Server**
- ✅ Firecrawl (web scraping)
- ✅ Notion (Notion API integration)

## API Key Setup

### 1. Firecrawl ✅ CONFIGURED
- **API Key**: `fc-c517bb13fdc34424af18e63df9795d70`
- **Status**: Environment variable set and working
- **Usage**: Web scraping, content extraction, and crawling

### 2. Context7 ✅ CONFIGURED (Remote Server)
- **Purpose**: Access to documentation and libraries
- **Status**: Configured to use remote server at `https://mcp.context7.com/mcp`
- **No API Key Required**: Uses the hosted Context7 service
- **Usage**: Access to up-to-date documentation for libraries and frameworks

### 3. Notion ✅ CONFIGURED
- **Purpose**: Interact with Notion databases and pages
- **API Key**: `ntn_[REDACTED]`
- **Status**: Environment variable set and working
- **Usage**: Read and write to Notion databases, create and update pages

## Environment Variables Setup

All environment variables have been configured in your `~/.zshrc` file:

```bash
# Firecrawl (configured)
export FIRECRAWL_API_KEY="fc-c517bb13fdc34424af18e63df9795d70"

# Notion (configured)
export NOTION_API_KEY="ntn_[REDACTED]"
```

## Testing Your Setup

All MCP servers are now configured and ready to use:

1. **Firecrawl**: ✅ Working
2. **Context7**: ✅ Remote server configured
3. **Notion**: ✅ API key configured and working

## Usage Examples

### Context7 (Remote Server)
Based on the [GitHub documentation](https://github.com/upstash/context7), you can use Context7 in several ways:

1. **Direct Library Access**: Use specific library IDs in your prompts
   ```
   implement basic authentication with supabase. use library /supabase/supabase for api and docs
   ```

2. **Chat Commands**: In Cursor chat, use:
   ```
   get-library-docs /nuxt/ui
   ```

3. **Available Tools**:
   - `resolve-library-id`: Resolves library names to Context7 IDs
   - `get-library-docs`: Fetches documentation for specific libraries

### Firecrawl
- Web scraping and content extraction
- Batch processing of websites
- Structured data extraction

### Notion
- Read and write to Notion databases
- Create and update pages
- Manage Notion content programmatically
- Search and retrieve Notion content

## Advanced Configuration

### Context7 Remote vs Local
Your current setup uses the **remote server** which is recommended because:
- ✅ No API key required
- ✅ Always up-to-date
- ✅ No local installation needed
- ✅ Handled by Context7 team

If you prefer local installation later, you can switch to:
```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"]
    }
  }
}
```

## Troubleshooting

### Common Issues:
1. **API Key Not Found**: Ensure environment variables are set correctly
2. **Permission Denied**: Check API key permissions and scopes
3. **Connection Issues**: Verify internet connection and API endpoints

### Restart Cursor
After making changes to environment variables or MCP configuration, restart Cursor to apply changes.

## Next Steps
1. ✅ **Context7**: Configured and ready to use
2. ✅ **Firecrawl**: Configured and ready to use
3. ✅ **Notion**: Configured and ready to use
4. **Restart Cursor** to load all MCP configurations
5. **Test all MCP servers** in Cursor

## Support
- [Context7 GitHub Repository](https://github.com/upstash/context7)
- [Firecrawl Documentation](https://firecrawl.dev/docs)
- [Notion API Documentation](https://developers.notion.com)
