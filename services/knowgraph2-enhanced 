import { ProjectScan } from '../models/projectScan';
import { DependencyAnalysis } from '../models/dependencyAnalysis';
import { CodeEntity } from '../models/codeEntity';
import { Graph } from '../utils/graph';

export class KnowledgeGraphService {
  private graph: Graph;
  private userAbilityCache: Map<string, any>;
  
  constructor() {
    this.graph = new Graph();
    this.userAbilityCache = new Map<string, any>();
    this.initializeGraph();
  }
  
  /**
   * Initialize the knowledge graph with standard relationships
   */
  private initializeGraph(): void {
    // Add common programming concepts, frameworks, libraries relationships
    this.addCommonFrameworkRelationships();
    this.addCommonErrorPatterns();
  }
  
  /**
   * Build project knowledge graph from scan results
   * @param projectScan Results of project scanning
   */
  public buildProjectGraph(projectScan: ProjectScan): void {
    // Add project entities to graph
    this.addFilesToGraph(projectScan.files);
    this.addDependenciesToGraph(projectScan.dependencies);
    
    // Analyze and add code entities (classes, functions, etc)
    if (projectScan.codeEntities) {
      this.addCodeEntitiesToGraph(projectScan.codeEntities);
    }
    
    // Extract relationships between entities
    this.extractCodeRelationships(projectScan);
  }
  
  /**
   * Add file nodes to knowledge graph
   */
  private addFilesToGraph(files: any[]): void {
    files.forEach(file => {
      this.graph.addNode({
        id: `file:${file.path}`,
        type: 'file',
        data: {
          path: file.path,
          language: file.language,
          size: file.size,
          lastModified: file.lastModified
        }
      });
    });
  }
  
  /**
   * Add project dependencies to knowledge graph
   */
  private addDependenciesToGraph(dependencies: DependencyAnalysis): void {
    // Add each dependency as a node
    Object.entries(dependencies.direct).forEach(([name, version]) => {
      this.graph.addNode({
        id: `dependency:${name}`,
        type: 'dependency',
        data: {
          name,
          version,
          isDirect: true
        }
      });
    });
    
    // Add transitive dependencies
    Object.entries(dependencies.transitive || {}).forEach(([name, version]) => {
      this.graph.addNode({
        id: `dependency:${name}`,
        type: 'dependency',
        data: {
          name,
          version,
          isDirect: false
        }
      });
    });
    
    // Add edges between related dependencies
    if (dependencies.dependencyTree) {
      this.processDependencyTree(dependencies.dependencyTree);
    }
  }
  
  /**
   * Process dependency tree to add relationship edges
   */
  private processDependencyTree(tree: any, parent?: string): void {
    Object.entries(tree).forEach(([name, subtree]) => {
      const nodeId = `dependency:${name}`;
      
      if (parent) {
        this.graph.addEdge({
          from: `dependency:${parent}`,
          to: nodeId,
          type: 'requires'
        });
      }
      
      if (typeof subtree === 'object' && subtree !== null) {
        this.processDependencyTree(subtree, name);
      }
    });
  }
  
  /**
   * Add code entities (classes, functions, methods) to graph
   */
  private addCodeEntitiesToGraph(entities: CodeEntity[]): void {
    entities.forEach(entity => {
      this.graph.addNode({
        id: `entity:${entity.type}:${entity.name}:${entity.file}:${entity.position}`,
        type: 'codeEntity',
        data: {
          name: entity.name,
          type: entity.type,
          file: entity.file,
          position: entity.position,
          complexity: entity.complexity,
          lines: entity.lines
        }
      });
      
      // Connect entity to its file
      this.graph.addEdge({
        from: `file:${entity.file}`,
        to: `entity:${entity.type}:${entity.name}:${entity.file}:${entity.position}`,
        type: 'contains'
      });
    });
  }
  
  /**
   * Extract and add relationships between code entities
   */
  private extractCodeRelationships(projectScan: ProjectScan): void {
    if (!projectScan.codeEntities) return;
    
    // Process imports/requires between files
    if (projectScan.imports) {
      projectScan.imports.forEach(imp => {
        this.graph.addEdge({
          from: `file:${imp.sourceFile}`,
          to: `file:${imp.targetFile}`,
          type: 'imports'
        });
      });
    }
    
    // Process function calls
    if (projectScan.functionCalls) {
      projectScan.functionCalls.forEach(call => {
        // Find the caller and callee entities
        const callerEntity = projectScan.codeEntities?.find(e => 
          e.file === call.sourceFile && 
          e.name === call.sourceFunction);
          
        const calleeEntity = projectScan.codeEntities?.find(e => 
          e.file === call.targetFile && 
          e.name === call.targetFunction);
          
        if (callerEntity && calleeEntity) {
          const callerId = `entity:${callerEntity.type}:${callerEntity.name}:${callerEntity.file}:${callerEntity.position}`;
          const calleeId = `entity:${calleeEntity.type}:${calleeEntity.name}:${calleeEntity.file}:${calleeEntity.position}`;
          
          this.graph.addEdge({
            from: callerId,
            to: calleeId,
            type: 'calls',
            data: {
              count: call.count || 1
            }
          });
        }
      });
    }
  }
  
  /**
   * Add common framework relationships to knowledge graph
   */
  private addCommonFrameworkRelationships(): void {
    // Add nodes for common frameworks and their relationships
    const frameworks = [
      { id: 'framework:react', name: 'React', type: 'ui', ecosystem: 'javascript' },
      { id: 'framework:angular', name: 'Angular', type: 'ui', ecosystem: 'javascript' },
      { id: 'framework:vue', name: 'Vue', type: 'ui', ecosystem: 'javascript' },
      { id: 'framework:django', name: 'Django', type: 'backend', ecosystem: 'python' },
      { id: 'framework:flask', name: 'Flask', type: 'backend', ecosystem: 'python' },
      { id: 'framework:express', name: 'Express', type: 'backend', ecosystem: 'javascript' },
      { id: 'framework:spring', name: 'Spring', type: 'backend', ecosystem: 'java' },
      // Add more as needed
    ];
    
    frameworks.forEach(framework => {
      this.graph.addNode({
        id: framework.id,
        type: 'framework',
        data: framework
      });
    });
    
    // Add relationships between frameworks
    // Example: React ecosystem related libraries
    this.graph.addEdge({
      from: 'framework:react',
      to: 'dependency:react-router',
      type: 'ecosystem'
    });
    
    this.graph.addEdge({
      from: 'framework:react',
      to: 'dependency:redux',
      type: 'ecosystem'
    });
    
    // Add more relationships as needed
  }
  
  /**
   * Add common error patterns to knowledge graph
   */
  private addCommonErrorPatterns(): void {
    // Common errors in various languages/frameworks
    const errorPatterns = [
      { 
        id: 'error:javascript:undefined', 
        message: 'Cannot read property of undefined',
        solutions: ['Check if object exists before accessing properties', 'Use optional chaining'] 
      },
      { 
        id: 'error:python:indentation', 
        message: 'IndentationError',
        solutions: ['Check spaces vs tabs', 'Ensure consistent indentation'] 
      },
      // Add more error patterns
    ];
    
    errorPatterns.forEach(error => {
      this.graph.addNode({
        id: error.id,
        type: 'errorPattern',
        data: error
      });
    });
  }
  
  /**
   * Get related issues for a given error
   * @param error Error information to find related issues
   * @returns Array of related issues or solutions
   */
  public getRelatedIssues(error: any): any[] {
    if (!error) return [];
    
    // Extract error message and other details
    const errorMessage = error.message || error.toString();
    
    // Search knowledge graph for similar error patterns
    const errorNodes = this.graph.findNodes(node => 
      node.type === 'errorPattern' && 
      errorMessage.includes(node.data.message)
    );
    
    // Get GitHub issues or StackOverflow questions related to this error
    const relatedIssues = this.findExternalReferences(errorMessage);
    
    // Combine error patterns with external references
    return [
      ...errorNodes.map(node => ({
        type: 'knownPattern',
        message: node.data.message,
        solutions: node.data.solutions
      })),
      ...relatedIssues
    ];
  }
  
  /**
   * Find external references for an error
   * @param errorMessage Error message to search for
   * @returns Array of related external references
   */
  private findExternalReferences(errorMessage: string): any[] {
    // In a real implementation, this might query GitHub, StackOverflow, etc.
    // For now, return simulated results
    return [
      {
        type: 'githubIssue',
        title: `Similar issue: ${errorMessage.substring(0, 50)}...`,
        url: 'https://github.com/example/repo/issues/123',
        status: 'resolved'
      },
      {
        type: 'stackOverflow',
        title: `How to fix: ${errorMessage.substring(0, 40)}...`,
        url: 'https://stackoverflow.com/questions/12345678',
        acceptedAnswer: true
      }
    ];
  }
  
  /**
   * Get user's technical ability level based on past interactions
   * @param userId User identifier
   * @returns User ability assessment
   */
  public getUserAbility(userId: string): any {
    // Check cache first
    if (this.userAbilityCache.has(userId)) {
      return this.userAbilityCache.get(userId);
    }
    
    // In a real implementation, this would analyze past interactions
    // For now, return default abilities
    const ability = {
      programmingLevel: 'intermediate',
      languages: {
        javascript: 0.8,
        python: 0.6,
        typescript: 0.7
      },
      frameworks: {
        react: 0.75,
        node: 0.8
      },
      preferredExplanationLevel: 'detailed'
    };
    
    // Cache the result
    this.userAbilityCache.set(userId, ability);
    
    return ability;
  }
  
  /**
   * Extract most relevant context for a given task
   * @param taskMessage Task message to extract context for
   * @param maxNodes Maximum number of nodes to include
   * @returns Relevant context from knowledge graph
   */
  public getRelevantContext(taskMessage: any, maxNodes: number = 20): any {
    const query = taskMessage.content.toLowerCase();
    const metadata = taskMessage.metadata || {};
    
    // Extract keywords from query
    const keywords = this.extractKeywords(query);
    
    // Find relevant nodes in knowledge graph
    const relevantNodes = this.findRelevantNodes(keywords, metadata.taskType);
    
    // Sort by relevance score
    relevantNodes.sort((a, b) => b.relevance - a.relevance);
    
    // Take top N nodes
    const topNodes = relevantNodes.slice(0, maxNodes);
    
    // Extract connected relationships
    const context = this.buildContextFromNodes(topNodes);
    
    return context;
  }
  
  /**
   * Extract keywords from query text
   */
  private extractKeywords(query: string): string[] {
    // Simple keyword extraction - in real implementation would use NLP
    return query
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !['the', 'and', 'that', 'have', 'for', 'with'].includes(word));
  }
  
  /**
   * Find relevant nodes based on keywords and task type
   */
  private findRelevantNodes(keywords: string[], taskType?: string): any[] {
    const relevantNodes: any[] = [];
    
    // Search nodes by keywords
    this.graph.getAllNodes().forEach(node => {
      // Calculate relevance score based on keyword matches
      const nodeText = JSON.stringify(node.data).toLowerCase();
      const keywordMatches = keywords.filter(keyword => nodeText.includes(keyword)).length;
      const relevance = keywordMatches / keywords.length;
      
      // Consider task type for additional relevance
      let taskTypeRelevance = 0;
      if (taskType) {
        if (taskType === 'dependency-check' && node.type === 'dependency') {
          taskTypeRelevance = 0.5;
        } else if (taskType === 'static-analysis' && node.type === 'codeEntity') {
          taskTypeRelevance = 0.5;
        }
        // Add more task type considerations as needed
      }
      
      // Add to relevant nodes if score is meaningful
      if (relevance > 0 || taskTypeRelevance > 0) {
        relevantNodes.push({
          node,
          relevance: relevance + taskTypeRelevance
        });
      }
    });
    
    return relevantNodes;
  }
  
  /**
   * Build context object from relevant nodes
   */
  private buildContextFromNodes(relevantNodes: any[]): any {
    const context: any = {
      entities: [],
      relationships: [],
      summary: {}
    };
    
    // Track included node IDs to avoid duplicates
    const includedNodeIds = new Set<string>();
    
    // Add nodes to context
    relevantNodes.forEach(({node}) => {
      includedNodeIds.add(node.id);
      context.entities.push({
        id: node.id,
        type: node.type,
        data: node.data
      });
      
      // Find direct relationships from this node
      const edges = this.graph.getEdgesFrom(node.id);
      edges.forEach(edge => {
        if (includedNodeIds.has(edge.to)) {
          context.relationships.push({
            from: edge.from,
            to: edge.to,
            type: edge.type,
            data: edge.data
          });
        }
      });
    });
    
    // Generate summary statistics
    context.summary = {
      entityCount: context.entities.length,
      relationshipCount: context.relationships.length,
      entityTypes: this.countByType(context.entities, 'type'),
      relationshipTypes: this.countByType(context.relationships, 'type')
    };
    
    return context;
  }
  
  /**
   * Count items by a specific property
   */
  private countByType(items: any[], property: string): Record<string, number> {
    const counts: Record<string, number> = {};
    
    items.forEach(item => {
      const type = item[property];
      counts[type] = (counts[type] || 0) + 1;
    });
    
    return counts;
  }
}