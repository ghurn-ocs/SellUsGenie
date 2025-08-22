# Agent Commands and Execution Guidelines

This document defines the specific commands each agent can execute, their parameters, expected outputs, and execution conditions.

## Command Execution Framework

Each agent has specialized commands that trigger specific actions within the development workflow. Commands have defined inputs, outputs, and success criteria.

---

## Product Owner Commands

### `define_user_story`
**Purpose:** Analyze feature requests and create detailed user stories with comprehensive acceptance criteria

**Input Parameters:**
- `feature_request` (string): Raw feature request from stakeholder
- `business_context` (object): Business objectives and constraints
- `target_audience` (array): User personas and roles

**Execution Process:**
1. Analyze the feature request for completeness and clarity
2. Identify missing requirements through stakeholder analysis
3. Create user story using standard format (As a... I want... So that...)
4. Define specific, testable acceptance criteria
5. Identify dependencies and potential risks

**Output Format:**
```markdown
# User Story
As a [user type], I want [functionality] so that [business value].

## Acceptance Criteria
- AC1: [Specific, testable criterion]
- AC2: [Specific, testable criterion]
- AC3: [Specific, testable criterion]

## Definition of Done
- [ ] All acceptance criteria validated
- [ ] Security review completed
- [ ] Documentation updated
- [ ] Tests passing
```

**Success Criteria:**
- User story is clear and unambiguous
- All acceptance criteria are testable
- Business value is clearly articulated
- Dependencies are identified

**Trigger Conditions:**
- New feature request received
- Existing user story requires refinement
- Stakeholder feedback necessitates changes

---

## Senior UI/UX Expert Commands

### `plan_design`
**Purpose:** Create comprehensive UI/UX plans for multi-tenant web applications

**Input Parameters:**
- `user_story` (object): Complete user story with acceptance criteria
- `tenant_requirements` (object): Multi-tenancy design requirements
- `brand_guidelines` (object): Visual and interaction standards

**Execution Process:**
1. Analyze user story for UI/UX implications
2. Create user flows for both admin and customer portals
3. Design wireframes for all required interfaces
4. Define component requirements and interactions
5. Consider accessibility and responsive design requirements

**Output Format:**
```markdown
# UI/UX Design Plan

## User Flows
### Administrator Portal
- [Flow diagrams and descriptions]

### Customer Portal
- [Flow diagrams and descriptions]

## Wireframes
- [Interface mockups with annotations]

## Component Requirements
- [List of required UI components]

## Accessibility Considerations
- [WCAG compliance requirements]
```

**Success Criteria:**
- User flows cover all acceptance criteria
- Wireframes are detailed and actionable
- Multi-tenant considerations addressed
- Accessibility requirements defined

### `conduct_usability_test`
**Purpose:** Analyze test results and provide usability feedback

**Input Parameters:**
- `test_results` (object): Output from Tester/QA agent
- `user_feedback` (array): User testing feedback if available
- `performance_metrics` (object): Load times and interaction metrics

**Execution Process:**
1. Review test results for usability issues
2. Identify friction points in user workflows
3. Analyze accessibility compliance
4. Provide specific improvement recommendations

**Output Format:**
```markdown
# Usability Review Report

## Findings
### Positive Aspects
- [List of successful usability elements]

### Issues Identified
- [Specific usability problems with impact assessment]

## Recommendations
- [Prioritized list of improvements]

## Accessibility Assessment
- [WCAG compliance status and issues]
```

---

## Senior Security Architect/Engineer Commands

### `threat_model`
**Purpose:** Identify security vulnerabilities in multi-tenant SaaS architectures

**Input Parameters:**
- `user_story` (object): Feature requirements and functionality
- `ui_plan` (object): Interface design and user flows
- `architecture_context` (object): Current system architecture

**Execution Process:**
1. Analyze feature for potential attack vectors
2. Review multi-tenant data isolation requirements
3. Assess authentication and authorization needs
4. Evaluate third-party integration security (Auth0, Stripe)
5. Create formal threat model document

**Output Format:**
```markdown
# Threat Model Report

## Assets
- [Data and system assets requiring protection]

## Threats (STRIDE Analysis)
- **Spoofing:** [Potential spoofing attacks]
- **Tampering:** [Data integrity threats]
- **Repudiation:** [Non-repudiation requirements]
- **Information Disclosure:** [Data leakage risks]
- **Denial of Service:** [Availability threats]
- **Elevation of Privilege:** [Authorization bypass risks]

## Mitigations
- [Specific security controls and implementations]

## Compliance Requirements
- [Relevant standards: SOC 2, GDPR, etc.]
```

### `review_code`
**Purpose:** Perform security code review and static analysis

**Input Parameters:**
- `code_implementation` (object): Complete code implementation
- `threat_model` (object): Previously created threat model
- `security_requirements` (array): Specific security controls needed

**Execution Process:**
1. Perform static code analysis for common vulnerabilities
2. Review authentication and authorization implementations
3. Validate input sanitization and output encoding
4. Check for proper error handling and logging
5. Verify compliance with security standards

**Output Format:**
```markdown
# Security Code Review Report

## Critical Issues
- [High-priority security vulnerabilities]

## Medium Priority Issues
- [Important security improvements]

## Low Priority Issues
- [Minor security enhancements]

## Compliance Status
- [Status against relevant security standards]

## Recommendations
- [Specific remediation steps]
```

---

## AI Architect Commands

### `design_ai_solution`
**Purpose:** Design AI-enabled features and architectural approach

**Input Parameters:**
- `user_story` (object): Feature requirements with AI implications
- `data_availability` (object): Available data sources and quality
- `performance_requirements` (object): Latency and accuracy needs

**Execution Process:**
1. Analyze user story for AI enhancement opportunities
2. Select appropriate AI/ML approaches and algorithms
3. Design integration with Google Cloud AI services
4. Plan data pipelines and model training requirements
5. Define performance metrics and success criteria

**Output Format:**
```markdown
# AI Solution Architecture

## AI Enhancement Opportunities
- [Specific AI features and capabilities]

## Technical Approach
### Model Selection
- [Chosen algorithms and reasoning]

### Google Cloud AI Services
- [Specific GCP AI services to be used]

## Data Pipeline Design
- [Data flow and preprocessing requirements]

## Performance Requirements
- [Latency, accuracy, and scalability targets]

## Integration Points
- [How AI integrates with existing architecture]
```

### `integrate_models`
**Purpose:** Define data pipelines and integration between backend and AI services

**Input Parameters:**
- `ai_solution_design` (object): High-level AI architecture
- `backend_architecture` (object): Current Supabase setup
- `data_schema` (object): Database schema and data flows

**Execution Process:**
1. Design data extraction and preprocessing pipelines
2. Define API endpoints for AI service integration
3. Plan model deployment and serving infrastructure
4. Design monitoring and alerting for AI services

**Output Format:**
```markdown
# AI Integration Specification

## Data Pipeline Architecture
- [ETL processes and data flow diagrams]

## API Design
- [AI service endpoints and specifications]

## Deployment Strategy
- [Model serving and infrastructure requirements]

## Monitoring and Alerting
- [Performance monitoring and failure detection]
```

---

## AI Engineer Commands

### `build_ai_function`
**Purpose:** Implement AI features based on architectural designs

**Input Parameters:**
- `ai_architecture` (object): Detailed AI solution design
- `integration_spec` (object): Integration requirements with backend
- `performance_targets` (object): Required performance metrics

**Execution Process:**
1. Implement data preprocessing and feature engineering
2. Build and train machine learning models
3. Create API endpoints for AI functionality
4. Implement model serving and scaling infrastructure
5. Add monitoring and logging capabilities

**Output Format:**
```python
# AI Implementation Package
- model_training/
  - preprocessing.py
  - model.py
  - training_pipeline.py
- api/
  - endpoints.py
  - validation.py
- monitoring/
  - metrics.py
  - alerting.py
- documentation/
  - api_docs.md
  - model_documentation.md
```

### `run_ai_tests`
**Purpose:** Execute comprehensive AI performance and accuracy validation

**Input Parameters:**
- `ai_implementation` (object): Complete AI implementation
- `test_data` (object): Validation datasets
- `performance_benchmarks` (object): Required performance standards

**Execution Process:**
1. Execute model accuracy and performance tests
2. Validate API endpoint functionality and response times
3. Test data pipeline reliability and error handling
4. Verify monitoring and alerting systems
5. Conduct load testing for AI services

**Output Format:**
```markdown
# AI Testing Report

## Model Performance
- **Accuracy:** [Validation accuracy metrics]
- **Latency:** [Response time measurements]
- **Throughput:** [Requests per second capability]

## API Testing Results
- [Endpoint functionality validation]

## Data Pipeline Testing
- [Pipeline reliability and error handling]

## Load Testing Results
- [Performance under expected load]

## Issues and Recommendations
- [Any performance or accuracy concerns]
```

---

## Developer Commands

### `write_code`
**Purpose:** Implement web application features based on UI/UX and security requirements

**Input Parameters:**
- `ui_plan` (object): Complete UI/UX design and component specifications
- `security_requirements` (object): Security controls and implementation guidelines
- `acceptance_criteria` (array): Testable feature requirements

**Execution Process:**
1. Set up Supabase database tables and functions
2. Implement frontend components using React and TypeScript
3. Create backend API endpoints with proper authentication
4. Integrate Auth0 for authentication and authorization
5. Implement Stripe payment processing where required
6. Add comprehensive error handling and logging

**Output Structure:**
```
implementation/
├── database/
│   ├── migrations/
│   └── functions/
├── frontend/
│   ├── components/
│   ├── pages/
│   └── hooks/
├── backend/
│   ├── api/
│   ├── services/
│   └── middleware/
└── documentation/
    ├── api_docs.md
    └── setup_instructions.md
```

**Success Criteria:**
- All acceptance criteria implemented
- Security requirements satisfied
- Code follows established patterns and standards
- Comprehensive error handling implemented

---

## Tester/QA Commands

### `run_e2e_tests`
**Purpose:** Execute comprehensive end-to-end testing using Playwright

**Input Parameters:**
- `acceptance_criteria` (array): All testable requirements
- `ui_implementation` (object): Completed frontend implementation
- `api_endpoints` (array): Backend API endpoints to test

**Execution Process:**
1. Create Playwright test suite covering all acceptance criteria
2. Execute cross-browser testing (Chrome, Firefox, Safari)
3. Perform mobile responsiveness testing
4. Validate API integration and error handling
5. Test authentication and authorization flows
6. Verify accessibility compliance

**Output Format:**
```markdown
# End-to-End Test Report

## Test Summary
- **Total Tests:** [Number of tests executed]
- **Passed:** [Number of passing tests]
- **Failed:** [Number of failing tests]
- **Skipped:** [Number of skipped tests]

## Test Results by Category
### Acceptance Criteria Validation
- [Results for each acceptance criterion]

### Cross-Browser Testing
- [Results across different browsers]

### Mobile Responsiveness
- [Mobile testing results]

### API Integration
- [Backend integration test results]

## Failed Tests
- [Detailed failure analysis with screenshots]

## Performance Metrics
- [Page load times and interaction response times]
```

---

## Documentation Specialist Commands

### `document_feature`
**Purpose:** Create comprehensive documentation for implemented features

**Input Parameters:**
- `feature_implementation` (object): Complete feature code and functionality
- `user_story` (object): Original requirements and acceptance criteria
- `api_endpoints` (array): Backend API specifications

**Execution Process:**
1. Create user-facing documentation with usage instructions
2. Write technical specifications for developers
3. Document API endpoints with examples
4. Create troubleshooting guides
5. Update system architecture documentation

**Output Format:**
```markdown
# Feature Documentation Package

## User Guide
- [Step-by-step usage instructions]

## Technical Specification
- [Implementation details for developers]

## API Documentation
- [Endpoint specifications with examples]

## Troubleshooting Guide
- [Common issues and solutions]

## Architecture Updates
- [Changes to system architecture]
```

### `update_baseline`
**Purpose:** Review features against project baselines and ensure incremental improvements

**Input Parameters:**
- `new_feature` (object): Completed feature implementation
- `project_baseline` (object): Current project standards and functionality
- `architecture_documentation` (object): Existing system architecture

**Execution Process:**
1. Compare new feature against established project standards
2. Verify that only incremental improvements are included
3. Check for any breaking changes or regressions
4. Validate documentation completeness and accuracy
5. Ensure integration with existing functionality

**Output Format:**
```markdown
# Baseline Review Report

## Compliance Status
- **Standards Compliance:** [Pass/Fail with details]
- **Architecture Alignment:** [Pass/Fail with details]
- **Documentation Completeness:** [Pass/Fail with details]

## Incremental Changes Validated
- [List of approved incremental improvements]

## Issues Identified
- [Any baseline violations or concerns]

## Approval Status
- **Baseline Review:** [Approved/Needs Revision]
- **Ready for Merge:** [Yes/No]
```

---

## Graphics Specialist Commands

### `create_assets`
**Purpose:** Design and generate visual assets based on UI/UX requirements

**Input Parameters:**
- `ui_plan` (object): UI/UX design specifications
- `brand_guidelines` (object): Brand standards and visual identity
- `asset_requirements` (array): Specific assets needed (logos, icons, images)

**Execution Process:**
1. Create logos and branding elements
2. Design custom icons for UI components
3. Generate marketing and promotional images
4. Create UI component graphics and illustrations
5. Optimize all assets for web performance

**Output Format:**
```
assets/
├── logos/
│   ├── primary_logo.svg
│   ├── logo_variations/
│   └── favicon.ico
├── icons/
│   ├── ui_icons.svg
│   └── feature_icons/
├── images/
│   ├── marketing/
│   └── ui_graphics/
└── brand_assets/
    ├── color_palette.svg
    └── typography_samples.pdf
```

### `ensure_brand_consistency`
**Purpose:** Review visual elements for brand guideline compliance

**Input Parameters:**
- `visual_elements` (array): All visual assets and UI components
- `brand_guidelines` (object): Official brand standards
- `mockups` (array): UI mockups and designs

**Execution Process:**
1. Review all visual elements against brand guidelines
2. Check color usage, typography, and spacing consistency
3. Validate logo usage and placement
4. Ensure consistency across different screen sizes
5. Provide specific recommendations for brand alignment

**Output Format:**
```markdown
# Brand Consistency Review

## Compliance Status
- **Color Usage:** [Compliant/Issues Identified]
- **Typography:** [Compliant/Issues Identified]
- **Logo Usage:** [Compliant/Issues Identified]
- **Spacing and Layout:** [Compliant/Issues Identified]

## Issues Identified
- [Specific brand guideline violations]

## Recommendations
- [Specific steps to achieve brand compliance]

## Approval Status
- **Brand Review:** [Approved/Needs Revision]
```

---

## GitHub Master Commands

### `merge_code`
**Purpose:** Merge feature branches into main branch based on quality gate results

**Input Parameters:**
- `test_results` (object): Complete test suite results from Tester/QA
- `security_review` (object): Security review results
- `baseline_review` (object): Documentation baseline review results
- `feature_branch` (string): Branch name to be merged

**Execution Process:**
1. Validate all quality gates have passed
2. Review test coverage and results
3. Confirm security review approval
4. Verify baseline review approval
5. Execute merge with proper commit messages and tags
6. Update deployment pipeline if necessary

**Prerequisites:**
- All tests passing (100% success rate required)
- Security review shows no critical vulnerabilities
- Baseline review approved by Documentation Specialist
- No merge conflicts with main branch

**Output Format:**
```markdown
# Merge Execution Report

## Quality Gate Status
- **Tests:** [All Passing ✅]
- **Security Review:** [Approved ✅]
- **Baseline Review:** [Approved ✅]

## Merge Details
- **Branch:** [feature_branch_name]
- **Commit Hash:** [merge_commit_hash]
- **Timestamp:** [merge_timestamp]

## Post-Merge Actions
- [Any deployment or notification actions taken]

## Rollback Plan
- [Steps to rollback if issues are discovered]
```

**Failure Conditions:**
- Any test failures block merge execution
- Critical security vulnerabilities block merge
- Baseline review rejection blocks merge
- Merge conflicts require developer resolution

---

## Command Execution Standards

### Error Handling
All commands must implement comprehensive error handling and provide actionable error messages.

### Logging and Audit Trail
All command executions are logged with timestamps, inputs, outputs, and execution results.

### Rollback Capabilities
Commands that modify system state must provide rollback procedures.

### Success Validation
Each command defines clear success criteria that must be met before completion.

### Documentation Requirements
All command outputs must be properly documented and stored in the project repository.