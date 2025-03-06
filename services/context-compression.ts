import { TokenCounter } from '../utils/tokenCounter';
import { ContextPrioritizer } from '../utils/contextPrioritizer';
import { CodeSummarizer } from '../utils/codeSummarizer';

export class ContextCompressor {
  private tokenCounter: TokenCounter;
  private prioritizer: ContextPrioritizer;
  private summarizer: CodeSummarizer;
  
  constructor() {
    this.tokenCounter = new TokenCounter();
    this.prioritizer = new ContextPrioritizer();
    this.summarizer = new CodeSummarizer();
  }

  /**
   * Compresses context to fit within token limits while preserving essential information
   * @param context Full context object with code, metadata, and other information
   * @param maxTokens Maximum tokens allowed in the compressed result
   * @returns Optimized context object with minimal token usage
   */
  public compress(context: any, maxTokens: number = 2000): any {
    // Start with essential metadata that must be preserved
    const essentialMetadata = this.extractEssentialMetadata(context);
    const essentialTokens = this.tokenCounter.count(JSON.stringify(essentialMetadata));
    
    // Calculate remaining token budget
    const remainingTokens = maxTokens - essentialTokens;
    
    // Prioritize different context components
    const prioritizedComponents = this.prioritizer.prioritize(context);
    
    // Build compressed context with available token budget
    const compressedContext = {
      ...essentialMetadata,
      components: this.fitComponentsInBudget(prioritizedComponents, remainingTokens)
    };
    
    return compressedContext;
  }
  
  /**
   * Extract critical metadata that must be preserved in any context
   */
  private extractEssentialMetadata(context: any): any {
    return {
      userId: context.userId,
      projectType: context.projectType,
      requestType: context.requestType,
      timestamp: context.timestamp,
      // Include any other absolutely critical metadata
    };
  }
  
  /**
   * Fit as many prioritized components as possible within token budget
   */
  private fitComponentsInBudget(components: any[], budget: number): any[] {
    const result = [];
    let usedTokens = 0;
    
    for (const component of components) {
      // Calculate tokens for this component
      const componentJson = JSON.stringify(component);
      const componentTokens = this.tokenCounter.count(componentJson);
      
      // If we can fit it entirely, add it
      if (usedTokens + componentTokens <= budget) {
        result.push(component);
        usedTokens += componentTokens;
      } else {
        // Otherwise, try to compress this component
        const compressedComponent = this.compressComponent(component, budget - usedTokens);
        if (compressedComponent) {
          result.push(compressedComponent);
          break; // We've used all available tokens
        }
      }
    }
    
    return result;
  }
  
  /**
   * Compress a single component to fit in remaining budget
   */
  private compressComponent(component: any, budget: number): any | null {
    // Different compression strategies based on component type
    switch (component.type) {
      case 'code':
        return this.compressCodeComponent(component, budget);
      case 'dependencies':
        return this.compressDependenciesComponent(component, budget);
      case 'documentation':
        return this.compressDocumentationComponent(component, budget);
      default:
        return null; // Can't compress unknown component types
    }
  }
  
  /**
   * Compress code components using specialized techniques
   */
  private compressCodeComponent(component: any, budget: number): any | null {
    // If code is too large, summarize it
    if (this.tokenCounter.count(component.content) > budget) {
      return {
        type: 'code',
        path: component.path,
        summarizedContent: this.summarizer.summarize(component.content, budget),
        isCompressed: true
      };
    }
    return null;
  }
  
  /**
   * Compress dependencies info to fit in budget
   */
  private compressDependenciesComponent(component: any, budget: number): any | null {
    // Keep only the most important dependencies
    if (component.dependencies.length > 0) {
      const importantDeps = component.dependencies
        .sort((a: any, b: any) => b.importanceScore - a.importanceScore)
        .slice(0, Math.max(1, Math.floor(budget / 50))); // Rough estimate of deps per token budget
      
      return {
        type: 'dependencies',
        dependencies: importantDeps,
        totalCount: component.dependencies.length,
        isCompressed: true
      };
    }
    return null;
  }
  
  /**
   * Compress documentation to fit in budget
   */
  private compressDocumentationComponent(component: any, budget: number): any | null {
    // Use summarization techniques for documentation
    if (component.content && this.tokenCounter.count(component.content) > budget) {
      return {
        type: 'documentation',
        path: component.path,
        summarizedContent: this.summarizer.summarize(component.content, budget),
        isCompressed: true
      };
    }
    return null;
  }
}