# SellUsGenie Development Framework

## Overview

This framework orchestrates the complete software development cycle for SellUsGenie, a multi-tenant e-commerce platform that enables store owners to create and manage multiple online stores with unified billing. Features include OAuth authentication, comprehensive store management, advanced page builder system, and integrated payment processing.

**Project Owner:** SellUsGenie Development Team

## Framework Structure

```
Project-Orchestration/
├── README.md                 # This file - framework overview
├── Agents/                   # Agent definitions and specifications
│   ├── agent-roles.md
│   ├── agent-personalities.md
│   └── agent-commands.md
├── Process/                  # Workflow and process documentation
│   ├── development-flow.md
│   ├── quality-gates.md
│   └── deployment-process.md
└── Documents/                # Templates and standards
    ├── templates/
    ├── standards/
    └── examples/
```

## Primary Goal

Orchestrate the complete development lifecycle for SellUsGenie's multi-tenant e-commerce platform, ensuring seamless store creation, management, and customer experience across all features. Each feature must pass comprehensive testing, maintain data isolation through Row Level Security (RLS), and integrate seamlessly with the existing multi-store architecture.

## Key Principles

1. **Orchestrated Coordination** - Senior Program Manager ensures seamless agent coordination and project excellence
2. **Multi-Agent Collaboration** - Each agent has specialized expertise and clear responsibilities  
3. **Quality-First Approach** - Multiple validation gates ensure high-quality deliverables
4. **Security by Design** - Security considerations integrated throughout the entire process
5. **Comprehensive Testing** - End-to-end validation before deployment
6. **Documentation-Driven** - All features must be properly documented and baseline-reviewed

## Technology Stack

- **Frontend:** React 18, TypeScript, Tailwind CSS, Radix UI
- **State Management:** React Context, TanStack Query
- **Routing:** Wouter
- **Backend:** Supabase (PostgreSQL + Auth + Real-time)
- **Authentication:** OAuth (Google/Apple)
- **Payments:** Stripe with webhooks
- **Build Tool:** Vite
- **Testing:** Automated test suite with TypeScript validation
- **Version Control:** GitHub
- **Development:** Claude Code with MCP integration

## Quick Start

1. Review the [Agent Roles](./Agents/agent-roles.md) to understand each agent's responsibilities
2. Follow the [Development Flow](./Process/development-flow.md) for step-by-step process execution
3. Use the templates in [Documents/templates](./Documents/templates/) for consistent deliverables

## Success Criteria

A feature is considered complete when:
- ✅ All acceptance criteria for multi-tenant functionality are met
- ✅ UI/UX maintains consistency with SellUsGenie design system
- ✅ Row Level Security (RLS) policies ensure complete data isolation
- ✅ Automated test suite passes (TypeScript, components, database, security)
- ✅ Store switching and multi-tenant features work correctly
- ✅ Stripe integration functions properly (if payment-related)
- ✅ OAuth authentication flow remains unaffected
- ✅ Page builder system integration (if applicable)
- ✅ Documentation reflects current feature set
- ✅ Code is merged to main branch and deployed

## Support

For questions or issues with this framework, refer to the SellUsGenie development documentation in CLAUDE.md or create an issue in the project repository.