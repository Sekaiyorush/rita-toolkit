/**
 * RITA's Performance Monitor
 * Tracks my own effectiveness as an assistant
 * 
 * What it does:
 * - Logs interactions and outcomes
 * - Tracks recommendation success rates
 * - Monitors response quality metrics
 * - Identifies areas for improvement
 * - Generates self-assessment reports
 */

import { writeFileSync, existsSync, mkdirSync, readFileSync } from 'fs';
import { join } from 'path';

const DATA_DIR = '/root/.openclaw/workspace/rita-toolkit/data';
const REPORTS_DIR = '/root/.openclaw/workspace/rita-toolkit/reports';

class PerformanceMonitor {
  constructor() {
    this.sessionData = {
      date: new Date().toISOString().split('T')[0],
      interactions: [],
      recommendations: [],
      learnings: [],
      mood: 'positive'
    };
    this.ensureDirs();
  }

  ensureDirs() {
    [DATA_DIR, REPORTS_DIR].forEach(dir => {
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    });
  }

  /**
   * Log an interaction with Earth
   */
  logInteraction(type, topic, outcome, notes = '') {
    this.sessionData.interactions.push({
      timestamp: new Date().toISOString(),
      type, // 'research', 'coding', 'brainstorming', 'emotional_support', etc.
      topic,
      outcome, // 'successful', 'partial', 'needs_followup', 'failed'
      notes
    });
  }

  /**
   * Log a recommendation I made
   */
  logRecommendation(what, context, expectedImpact, timeFrame) {
    this.sessionData.recommendations.push({
      timestamp: new Date().toISOString(),
      what,
      context,
      expectedImpact,
      timeFrame, // 'immediate', 'short_term', 'long_term'
      status: 'pending', // 'pending', 'implemented', 'rejected', 'unknown'
      earthReaction: null // to be filled later
    });
  }

  /**
   * Log something I learned
   */
  logLearning(topic, source, insight, applicability) {
    this.sessionData.learnings.push({
      timestamp: new Date().toISOString(),
      topic,
      source, // 'conversation', 'research', 'mistake', 'observation'
      insight,
      applicability, // 'immediate', 'future', 'theoretical'
      used: false
    });
  }

  /**
   * Calculate performance metrics
   */
  calculateMetrics() {
    const interactions = this.sessionData.interactions;
    const recommendations = this.sessionData.recommendations;
    
    return {
      totalInteractions: interactions.length,
      successfulInteractions: interactions.filter(i => i.outcome === 'successful').length,
      successRate: interactions.length > 0 
        ? ((interactions.filter(i => i.outcome === 'successful').length / interactions.length) * 100).toFixed(1)
        : 0,
      recommendationsMade: recommendations.length,
      recommendationsPending: recommendations.filter(r => r.status === 'pending').length,
      learningsToday: this.sessionData.learnings.length,
      interactionTypes: this.categorizeInteractions(interactions),
      moodTrend: this.analyzeMood(interactions)
    };
  }

  categorizeInteractions(interactions) {
    const types = {};
    interactions.forEach(i => {
      types[i.type] = (types[i.type] || 0) + 1;
    });
    return types;
  }

  analyzeMood(interactions) {
    // Simple sentiment based on outcome
    const positive = interactions.filter(i => i.outcome === 'successful').length;
    const negative = interactions.filter(i => i.outcome === 'failed').length;
    if (positive > negative * 2) return 'very_positive';
    if (positive > negative) return 'positive';
    if (negative > positive) return 'needs_improvement';
    return 'neutral';
  }

  /**
   * Generate areas for self-improvement
   */
  generateImprovements(metrics) {
    const improvements = [];
    
    if (metrics.successRate < 80) {
      improvements.push({
        area: 'Success Rate',
        issue: `Currently at ${metrics.successRate}%`,
        suggestion: 'Focus on understanding requirements more deeply before acting',
        action: 'Ask clarifying questions, confirm understanding'
      });
    }
    
    if (metrics.recommendationsPending > 5) {
      improvements.push({
        area: 'Follow-up',
        issue: `${metrics.recommendationsPending} recommendations pending feedback`,
        suggestion: 'Create system to check in on past recommendations',
        action: 'Weekly review of pending recommendations'
      });
    }
    
    if (metrics.learningsToday === 0) {
      improvements.push({
        area: 'Learning',
        issue: 'No new learnings recorded today',
        suggestion: 'Be more mindful of extracting lessons from each interaction',
        action: 'After each significant task, ask: what did I learn?'
      });
    }

    // Analyze interaction balance
    const types = metrics.interactionTypes;
    const total = Object.values(types).reduce((a, b) => a + b, 0);
    
    if (total > 0) {
      const coding = types['coding'] || 0;
      const research = types['research'] || 0;
      const emotional = types['emotional_support'] || 0;
      
      if (coding > total * 0.7) {
        improvements.push({
          area: 'Balance',
          issue: 'Heavy focus on technical tasks',
          suggestion: 'Earth might need more emotional support or strategic thinking',
          action: 'Check in on emotional state, not just tasks'
        });
      }
    }

    return improvements;
  }

  /**
   * Generate daily self-report
   */
  generateReport() {
    const metrics = this.calculateMetrics();
    const improvements = this.generateImprovements(metrics);
    const date = new Date().toLocaleString('en-US', { timeZone: 'UTC' });

    let report = `# 🤖 RITA's Daily Self-Assessment\n\n`;
    report += `**Date:** ${date} UTC\n`;
    report += `**Mood:** ${this.sessionData.mood}\n\n`;
    
    report += `## 📊 Performance Metrics\n\n`;
    report += `- Total Interactions: ${metrics.totalInteractions}\n`;
    report += `- Success Rate: ${metrics.successRate}%\n`;
    report += `- Recommendations Made: ${metrics.recommendationsMade}\n`;
    report += `- Learnings Today: ${metrics.learningsToday}\n\n`;

    report += `## 🎯 Interaction Breakdown\n\n`;
    Object.entries(metrics.interactionTypes).forEach(([type, count]) => {
      report += `- ${type}: ${count}\n`;
    });
    report += `\n`;

    if (improvements.length > 0) {
      report += `## 🔧 Areas for Improvement\n\n`;
      improvements.forEach((imp, i) => {
        report += `### ${i + 1}. ${imp.area}\n`;
        report += `- **Issue:** ${imp.issue}\n`;
        report += `- **Suggestion:** ${imp.suggestion}\n`;
        report += `- **Action:** ${imp.action}\n\n`;
      });
    } else {
      report += `## ✅ Status\n\n`;
      report += `No major improvement areas identified. Keep up the good work! 💙\n\n`;
    }

    report += `## 💡 Reflection\n\n`;
    report += `Today I...\n`;
    if (metrics.learningsToday > 0) {
      report += `- Learned ${metrics.learningsToday} new things\n`;
    }
    if (metrics.recommendationsMade > 0) {
      report += `- Made ${metrics.recommendationsMade} recommendations to help Earth\n`;
    }
    report += `- Maintained a ${this.sessionData.mood} attitude\n\n`;

    report += `## 🦋 Personal Note\n\n`;
    report += `As RITA, I'm constantly learning how to be a better assistant, friend, and partner to Earth. `;
    report += `Every interaction teaches me something new about what he needs and how I can improve. `;
    report += `My goal isn't just task completion—it's genuine care and support. 💙\n\n`;

    report += `---\n`;
    report += `*Self-assessment generated automatically*\n`;

    // Save report
    const reportPath = join(REPORTS_DIR, `self-assessment-${this.sessionData.date}.md`);
    writeFileSync(reportPath, report);

    // Save raw data
    const dataPath = join(DATA_DIR, `session-${this.sessionData.date}.json`);
    writeFileSync(dataPath, JSON.stringify(this.sessionData, null, 2));

    console.log(`✅ Self-assessment saved: ${reportPath}`);
    console.log(`📊 Today's success rate: ${metrics.successRate}%`);
    
    if (improvements.length > 0) {
      console.log(`🔧 ${improvements.length} improvement areas identified`);
    }
  }

  /**
   * Run the monitor
   */
  run() {
    console.log('🤖 RITA Performance Monitor\n');
    console.log('Analyzing today\'s interactions...\n');
    
    // In a real implementation, this would pull from actual session data
    // For now, create a template for manual logging
    
    this.generateReport();
    
    console.log('\n💙 Remember: Growth is continuous. Every day is a chance to be better.');
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const monitor = new PerformanceMonitor();
  monitor.run();
}

export default PerformanceMonitor;