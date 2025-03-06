# DevContext: An MCP Extension for Development Context

## Core Concept
DevContext extends the Model Context Protocol (MCP) with specialized modules for software development assistance, particularly focused on helping novice developers navigate complex project environments.

## Architecture
DevContext operates as a modular extension to MCP rather than a competing standard:

```
MCP experiment mini core
  └── DevContext Extension
       ├── UserContext Module
       ├── ProjectAwareness Module
       ├── CommandSafety Module
       └── LearningPath Module
```

## Modules

### UserContext Module
Tracks and adapts to user skill level:
- Maintains profile of explained concepts
- Adjusts explanation depth automatically
- Remembers preferred tools and environments

### ProjectAwareness Module
Provides structural understanding:
- Detects project boundaries (package.json, requirements.txt)
- Maps nested dependency relationships
- Identifies cross-language integration points
- Prevents common errors from nested project structures

### CommandSafety Module
Ensures safe execution:
- Normalizes commands across operating systems
- Validates commands against project structure
- Provides warnings for potentially destructive operations
- Handles directory context awareness

### LearningPath Module
Accelerates skill development:
- Suggests concepts to learn based on current project
- Provides progressive complexity in explanations
- Maintains learning history to avoid repetition
- Connects code patterns to educational resources

## Data Flow
1. **Collection**: Project structure, command history, and user interactions feed into context
2. **Processing**: Context analyzed to build dynamic user and project profiles
3. **Application**: AI prompts enhanced with relevant context before generation
4. **Feedback**: User responses inform profile updates

## Implementation Strategy

### Phase 1: MCP Extension Definition
- Create DevContext specification compatible with MCP
- Define module interfaces and data schemas
- Develop simple knowledge graph for common DevNoob issues

### Phase 2: Reference Implementation
- Build VSCode extension implementing MCP+DevContext
- Create lightweight adapter for existing MCP implementations
- Develop simple problem signature database

### Phase 3: Knowledge Acquisition
- Build automated collection of common error patterns
- Implement simple training for error recognition
- Create contribution mechanism for community solutions

## Advantages Over Clean-Slate Approach
- Leverages existing MCP ecosystem
- Easier adoption path for current MCP users
- Modular design allows incremental implementation
- Focus on specific developer pain points rather than reinventing protocol basics

// DevContext: MCP Extension for Development Context
// A lightweight implementation that extends existing MCP

import { MCPClient, MCPMessage } from 'mcp-core'; // Hypothetical MCP implementation

// Extension point for MCP messages
interface DevContextMetadata {
  userSkill: {
    level: 'beginner' | 'intermediate' | 'advanced';
    explainedConcepts: string[];
  };
  projectContext: {
    boundaries: string[]; // Paths with package.json or similar
    nestedDependencies: boolean;
    languages: string[];
  };
  environmentInfo: {
    os: string;
    shell: string;
    currentDirectory: string;
  };
}

// MCP Extension Client
class DevContextClient {
  private mcpClient: MCPClient;
  private projectScanner: ProjectScanner;
  private commandValidator: CommandValidator;
  private userProfiler: UserProfiler;
  
  constructor(mcpClient: MCPClient) {
    this.mcpClient = mcpClient;
    this.projectScanner = new ProjectScanner();
    this.commandValidator = new CommandValidator();
    this.userProfiler = new UserProfiler();
  }
  
  // Main entry point to enhance MCP messages with development context
  async enhanceMessage(message: MCPMessage): Promise<MCPMessage> {
    // 1. Scan project if needed
    const projectContext = await this.getProjectContext();
    
    // 2. Update user profile based on message content
    const userContext = this.userProfiler.updateFromMessage(message);
    
    // 3. Get environment info
    const envInfo = await this.getEnvironmentInfo();
    
    // 4. Add DevContext metadata to MCP message
    return {
      ...message,
      metadata: {
        ...message.metadata,
        devContext: {
          userSkill: userContext,
          projectContext,
          environmentInfo: envInfo
        }
      }
    };
  }
  
  // Process commands through safety layer before execution
  async processCommand(command: string): Promise<{
    safeCommand: string;
    warnings: string[];
    explanationNeeded: boolean;
  }> {
    const projectContext = await this.getProjectContext();
    const envInfo = await this.getEnvironmentInfo();
    
    return this.commandValidator.validateAndNormalize(
      command, 
      projectContext,
      envInfo
    );
  }
  
  private async getProjectContext(): Promise<DevContextMetadata['projectContext']> {
    const currentDir = process.cwd();
    const boundaries = await this.projectScanner.findProjectBoundaries(currentDir);
    const languages = await this.projectScanner.detectLanguages(currentDir);
    const nestedDeps = this.projectScanner.hasNestedDependencies(boundaries);
    
    return {
      boundaries,
      nestedDependencies: nestedDeps,
      languages
    };
  }
  
  private async getEnvironmentInfo(): Promise<DevContextMetadata['environmentInfo']> {
    const os = process.platform;
    const shell = process.env.SHELL || 'unknown';
    const currentDirectory = process.cwd();
    
    return {
      os,
      shell,
      currentDirectory
    };
  }
}

// Project structure scanning
class ProjectScanner {
  async findProjectBoundaries(startDir: string): Promise<string[]> {
    // Find all package.json, requirements.txt, etc.
    // Return paths to each project boundary
    return []; // Simplified
  }
  
  async detectLanguages(dir: string): Promise<string[]> {
    // Detect languages based on file extensions
    return []; // Simplified
  }
  
  hasNestedDependencies(boundaries: string[]): boolean {
    // Check if any project boundaries are nested within others
    return boundaries.length > 1; // Simplified
  }
}

// Command validation and normalization
class CommandValidator {
  validateAndNormalize(
    command: string,
    projectContext: DevContextMetadata['projectContext'],
    envInfo: DevContextMetadata['environmentInfo']
  ): {
    safeCommand: string;
    warnings: string[];
    explanationNeeded: boolean;
  } {
    const warnings: string[] = [];
    let explanationNeeded = false;
    
    // Common npm issue detection
    if (
      command.startsWith('npm') && 
      projectContext.nestedDependencies &&
      !command.includes('--prefix')
    ) {
      warnings.push('Command may have unexpected behavior in nested npm projects');
      explanationNeeded = true;
    }
    
    // Normalize path separators based on OS
    let safeCommand = command;
    if (envInfo.os === 'win32' && command.includes('/')) {
      safeCommand = command.replace(/\//g, '\\');
    }
    
    return {
      safeCommand,
      warnings,
      explanationNeeded
    };
  }
}

// User profiling and skill tracking
class UserProfiler {
  private userSkill: DevContextMetadata['userSkill'] = {
    level: 'beginner',
    explainedConcepts: []
  };
  
  updateFromMessage(message: MCPMessage): DevContextMetadata['userSkill'] {
    // Analyze message to detect skill level and track explained concepts
    // Very simplified implementation
    return this.userSkill;
  }
  
  markConceptExplained(concept: string): void {
    if (!this.userSkill.explainedConcepts.includes(concept)) {
      this.userSkill.explainedConcepts.push(concept);
    }
  }
  
  shouldExplainConcept(concept: string): boolean {
    return !this.userSkill.explainedConcepts.includes(concept);
  }
}

// Knowledge graph for common DevNoob issues
class DevKnowledgeGraph {
  private patterns: Array<{
    pattern: RegExp;
    problem: string;
    solutions: string[];
    concepts: string[];
  }> = [
    {
      pattern: /npm ERR! enoent/i,
      problem: 'File or directory not found during npm operation',
      solutions: [
        'Check if you are in the correct directory',
        'Verify package.json exists in current directory',
        'Use --prefix flag to specify project directory'
      ],
      concepts: ['npm-paths', 'package-management', 'project-structure']
    },
    {
      pattern: /cannot find module/i,
      problem: 'Module dependency not installed or not found',
      solutions: [
        'Run npm install to install dependencies',
        'Check package.json for the dependency',
        'Check for typos in import statement'
      ],
      concepts: ['node-modules', 'import-system', 'dependency-management']
    }
  ];
  
  matchError(errorText: string): Array<{
    problem: string;
    solutions: string[];
    concepts: string[];
  }> {
    return this.patterns
      .filter(pattern => pattern.pattern.test(errorText))
      .map(({ problem, solutions, concepts }) => ({
        problem,
        solutions,
        concepts
      }));
  }
  
  // This would connect to a more sophisticated system in production
  addPattern(pattern: RegExp, problem: string, solutions: string[]): void {
    this.patterns.push({
      pattern,
      problem,
      solutions,
      concepts: []
    });
  }
}

// Example integration with MCP
async function exampleUsage() {
  // 1. Create MCP client (from hypothetical MCP library)
  const mcpClient = new MCPClient();
  
  // 2. Wrap with DevContext extension
  const devContext = new DevContextClient(mcpClient);
  
  // 3. When sending messages to AI, enhance with context
  const userMessage = {
    role: 'user',
    content: 'Help me run npm install in my project',
    metadata: {}
  };
  
  const enhancedMessage = await devContext.enhanceMessage(userMessage);
  
  // 4. Send to AI through MCP
  const aiResponse = await mcpClient.sendMessage(enhancedMessage);
  
  // 5. When executing commands, validate first
  const commandResult = await devContext.processCommand('npm install');
  if (commandResult.warnings.length > 0) {
    console.log('Warnings:', commandResult.warnings);
    // Could ask AI to explain the warnings if explanationNeeded is true
  }
  
  // 6. Execute the safe command
  console.log('Executing:', commandResult.safeCommand);
}