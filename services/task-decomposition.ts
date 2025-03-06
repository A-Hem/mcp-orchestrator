import { MCPMessage, OrchestrationMessage } from '../messages/types';

export class TaskDecomposer {
  /**
   * Parse AI-generated decomposition into structured task objects
   * @param content Raw AI response containing task decomposition
   * @returns Array of orchestration messages representing individual tasks
   */
  public parseDecomposition(content: string): OrchestrationMessage[] {
    // First try to parse JSON directly if AI returned valid JSON
    try {
      const parsedContent = JSON.parse(content);
      if (Array.isArray(parsedContent)) {
        return this.validateAndEnrichTasks(parsedContent);
      }
    } catch (e) {
      // Not valid JSON, continue with text parsing
    }

    // Extract task blocks using regex patterns
    const tasks: OrchestrationMessage[] = [];
    
    // Look for task definitions with format "Task X: Description"
    const taskPattern = /Task\s+(\d+):\s+([^\n]+)(?:\n*Description:\s*([^]*?))?(?:\n*Dependencies:\s*([^]*?))?(?:\n*Priority:\s*(\d+))?(?:\n*Worker:\s*([^]*?))?(?=\n*Task\s+\d+:|$)/gi;
    
    let match;
    while ((match = taskPattern.exec(content)) !== null) {
      const taskNumber = parseInt(match[1]);
      const taskName = match[2].trim();
      const description = match[3]?.trim() || '';
      const dependencies = match[4] ? this.parseDependencies(match[4]) : [];
      const priority = match[5] ? parseInt(match[5]) : 1;
      const worker = match[6]?.trim() || this.inferWorkerType(taskName, description);
      
      tasks.push({
        content: `Execute task: ${taskName}\n${description}`,
        metadata: {
          taskId: `task-${taskNumber}`,
          taskName,
          taskType: worker,
          priority,
          dependencies,
          status: 'pending',
          retries: 0
        }
      });
    }
    
    return this.validateAndEnrichTasks(tasks);
  }
  
  /**
   * Parse dependency string into array of task IDs
   */
  private parseDependencies(depString: string): string[] {
    // Parse comma-separated list or numbered list of dependencies
    const depPattern = /(?:Task\s*)?(\d+)|([a-z-_]+)/gi;
    const dependencies: string[] = [];
    
    let match;
    while ((match = depPattern.exec(depString)) !== null) {
      if (match[1]) { // Numeric reference
        dependencies.push(`task-${match[1]}`);
      } else if (match[2]) { // Named reference
        dependencies.push(match[2]);
      }
    }
    
    return dependencies;
  }
  
  /**
   * Validate tasks and ensure all required fields are present
   */
  private validateAndEnrichTasks(tasks: any[]): OrchestrationMessage[] {
    return tasks.map((task, index) => {
      // Ensure each task has the minimum required fields
      const taskId = task.metadata?.taskId || `task-${index + 1}`;
      const taskName = task.metadata?.taskName || `Task ${index + 1}`;
      const taskType = task.metadata?.taskType || this.inferWorkerType(taskName, task.content);
      
      return {
        content: task.content || `Execute task: ${taskName}`,
        metadata: {
          taskId,
          taskName,
          taskType,
          priority: task.metadata?.priority || 1,
          dependencies: task.metadata?.dependencies || [],
          status: 'pending',
          retries: 0,
          ...task.metadata
        }
      };
    });
  }
  
  /**
   * Infer the appropriate worker type based on task description
   */
  private inferWorkerType(taskName: string, description: string): string {
    const normalizedText = `${taskName} ${description}`.toLowerCase();
    
    if (normalizedText.includes('scan') || normalizedText.includes('project')) {
      return 'project-scan';
    } else if (normalizedText.includes('analyze') || normalizedText.includes('static')) {
      return 'static-analysis';
    } else if (normalizedText.includes('depend') || normalizedText.includes('package')) {
      return 'dependency-check';
    } else if (normalizedText.includes('innovat') || normalizedText.includes('suggest')) {
      return 'innovation-suggestion';
    } else if (normalizedText.includes('knowledge') || normalizedText.includes('graph')) {
      return 'knowledge';
    } else {
      return 'local-data'; // Default worker
    }
  }
  
  /**
   * Reorder tasks based on dependencies to ensure proper execution order
   */
  public buildExecutionPlan(tasks: OrchestrationMessage[]): OrchestrationMessage[] {
    // Create a map of task IDs to tasks
    const taskMap = new Map<string, OrchestrationMessage>();
    tasks.forEach(task => {
      taskMap.set(task.metadata.taskId, task);
    });
    
    // Track dependencies and dependents
    const dependencyGraph = new Map<string, Set<string>>();
    const dependentsGraph = new Map<string, Set<string>>();
    
    // Initialize graphs
    tasks.forEach(task => {
      dependencyGraph.set(task.metadata.taskId, new Set<string>());
      dependentsGraph.set(task.metadata.taskId, new Set<string>());
    });
    
    // Populate dependency relationships
    tasks.forEach(task => {
      const taskId = task.metadata.taskId;
      const dependencies = task.metadata.dependencies || [];
      
      dependencies.forEach(depId => {
        if (taskMap.has(depId)) {
          dependencyGraph.get(taskId)?.add(depId);
          dependentsGraph.get(depId)?.add(taskId);
        }
      });
    });
    
    // Topological sort for execution order
    const executionOrder: OrchestrationMessage[] = [];
    const visited = new Set<string>();
    const temp = new Set<string>();
    
    const visit = (taskId: string) => {
      if (temp.has(taskId)) {
        throw new Error(`Dependency cycle detected involving task ${taskId}`);
      }
      if (visited.has(taskId)) {
        return;
      }
      
      temp.add(taskId);
      const dependencies = dependencyGraph.get(taskId) || new Set<string>();
      
      for (const depId of dependencies) {
        visit(depId);
      }
      
      temp.delete(taskId);
      visited.add(taskId);
      
      if (taskMap.has(taskId)) {
        executionOrder.push(taskMap.get(taskId)!);
      }
    };
    
    // Visit all tasks
    for (const taskId of taskMap.keys()) {
      if (!visited.has(taskId)) {
        visit(taskId);
      }
    }
    
    // Reverse to get correct execution order
    return executionOrder.reverse();
  }
}