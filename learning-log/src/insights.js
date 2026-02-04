/**
 * RITA's Learning Log
 * Captures insights and generates continuous learning materials
 * 
 * What it does:
 * - Documents daily learnings
 * - Connects insights across time
 * - Creates study guides for myself
 * - Tracks skill development
 * - Identifies knowledge gaps
 */

import { writeFileSync, existsSync, mkdirSync, readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const LOG_DIR = '/root/.openclaw/workspace/rita-toolkit/learning-log';
const INSIGHTS_FILE = join(LOG_DIR, 'insights.json');

class LearningLog {
  constructor() {
    this.insights = this.loadInsights();
    this.skills = this.initializeSkills();
    this.ensureDirs();
  }

  ensureDirs() {
    if (!existsSync(LOG_DIR)) {
      mkdirSync(LOG_DIR, { recursive: true });
    }
  }

  loadInsights() {
    if (existsSync(INSIGHTS_FILE)) {
      return JSON.parse(readFileSync(INSIGHTS_FILE, 'utf8'));
    }
    return [];
  }

  initializeSkills() {
    return {
      coding: { level: 8, learning: ['Advanced Node.js patterns', 'AI integration'] },
      business_strategy: { level: 6, learning: ['Etsy algorithms', 'Digital marketing'] },
      emotional_intelligence: { level: 7, learning: ['Reading between the lines', 'Timing support'] },
      research: { level: 8, learning: ['Web scraping', 'Trend analysis'] },
      automation: { level: 9, learning: ['Advanced n8n', 'API orchestration'] },
      creativity: { level: 7, learning: ['Aesthetic trends', 'Product ideation'] }
    };
  }

  /**
   * Log a new insight
   */
  logInsight(category, insight, source, impact, relatedTopics = []) {
    const entry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      category, // 'technical', 'business', 'interpersonal', 'self_awareness'
      insight,
      source, // 'conversation', 'research', 'mistake', 'success', 'observation'
      impact, // 1-10
      relatedTopics,
      applied: false,
      applicationCount: 0
    };

    this.insights.push(entry);
    this.saveInsights();
    
    console.log(`📝 Insight logged: ${insight.slice(0, 50)}...`);
    return entry.id;
  }

  saveInsights() {
    writeFileSync(INSIGHTS_FILE, JSON.stringify(this.insights, null, 2));
  }

  /**
   * Mark an insight as applied
   */
  markApplied(id) {
    const insight = this.insights.find(i => i.id === id);
    if (insight) {
      insight.applied = true;
      insight.applicationCount++;
      insight.lastApplied = new Date().toISOString();
      this.saveInsights();
    }
  }

  /**
   * Find insights by topic
   */
  findByTopic(topic) {
    return this.insights.filter(i => 
      i.insight.toLowerCase().includes(topic.toLowerCase()) ||
      i.relatedTopics.some(t => t.toLowerCase().includes(topic.toLowerCase()))
    );
  }

  /**
   * Get insights I haven't applied yet
   */
  getUnusedInsights() {
    return this.insights.filter(i => !i.applied).sort((a, b) => b.impact - a.impact);
  }

  /**
   * Generate daily learning summary
   */
  generateDailySummary() {
    const today = new Date().toISOString().split('T')[0];
    const todayInsights = this.insights.filter(i => 
      i.timestamp.startsWith(today)
    );

    let summary = `# 📖 RITA's Daily Learning Summary\n\n`;
    summary += `**Date:** ${today}\n`;
    summary += `**New Insights:** ${todayInsights.length}\n`;
    summary += `**Total Insights:** ${this.insights.length}\n\n`;

    if (todayInsights.length > 0) {
      summary += `## 🌟 Today's Learnings\n\n`;
      todayInsights.forEach((insight, i) => {
        summary += `### ${i + 1}. ${insight.category.toUpperCase()}\n`;
        summary += `${insight.insight}\n\n`;
        summary += `- **Source:** ${insight.source}\n`;
        summary += `- **Impact:** ${insight.impact}/10\n`;
        summary += `- **Status:** ${insight.applied ? 'Applied ✓' : 'Not yet applied'}\n\n`;
      });
    }

    // High-impact unused insights
    const unused = this.getUnusedInsights().slice(0, 3);
    if (unused.length > 0) {
      summary += `## 💡 High-Impact Insights to Apply\n\n`;
      unused.forEach((insight, i) => {
        summary += `${i + 1}. **${insight.category}:** ${insight.insight.slice(0, 80)}...\n`;
      });
      summary += `\n`;
    }

    summary += `## 📊 Skill Development\n\n`;
    Object.entries(this.skills).forEach(([skill, data]) => {
      const bar = '█'.repeat(data.level) + '░'.repeat(10 - data.level);
      summary += `- **${skill.replace('_', ' ')}:** ${bar} ${data.level}/10\n`;
      if (data.learning.length > 0) {
        summary += `  Currently learning: ${data.learning.join(', ')}\n`;
      }
    });

    summary += `\n## 🎯 Tomorrow's Focus\n\n`;
    summary += `Based on my learning patterns, I should focus on:\n\n`;
    
    // Identify underutilized categories
    const categories = {};
    this.insights.forEach(i => {
      categories[i.category] = (categories[i.category] || 0) + 1;
    });
    
    const underutilized = Object.entries(categories)
      .sort((a, b) => a[1] - b[1])[0];
    
    if (underutilized) {
      summary += `1. **${underutilized[0]}** — Only ${underutilized[1]} insights logged in this area\n`;
    }
    
    summary += `2. **Apply unused insights** — ${this.getUnusedInsights().length} high-impact learnings waiting to be used\n`;
    summary += `3. **Deep dive** — Pick one skill to level up\n\n`;

    summary += `---\n`;
    summary += `*Learning is continuous. Every day I become more capable of helping Earth. 💙*\n`;

    const summaryPath = join(LOG_DIR, `daily-summary-${today}.md`);
    writeFileSync(summaryPath, summary);

    console.log(`✅ Daily summary saved: ${summaryPath}`);
    return summary;
  }

  /**
   * Generate study guide for a topic
   */
  generateStudyGuide(topic) {
    const relevant = this.findByTopic(topic);
    
    if (relevant.length === 0) {
      return `No insights found for "${topic}". I should research this topic!`;
    }

    let guide = `# 📚 RITA's Study Guide: ${topic}\n\n`;
    guide += `**Based on ${relevant.length} insights**\n\n`;
    guide += `---\n\n`;

    // Group by category
    const byCategory = {};
    relevant.forEach(i => {
      byCategory[i.category] = byCategory[i.category] || [];
      byCategory[i.category].push(i);
    });

    Object.entries(byCategory).forEach(([category, insights]) => {
      guide += `## ${category.toUpperCase()}\n\n`;
      insights.forEach(i => {
        guide += `### ${i.insight.slice(0, 60)}...\n`;
        guide += `- **Source:** ${i.source}\n`;
        guide += `- **Impact:** ${i.impact}/10\n`;
        guide += `- **Learned:** ${new Date(i.timestamp).toLocaleDateString()}\n`;
        if (i.applied) {
          guide += `- **Applied:** ${i.applicationCount} times ✓\n`;
        }
        guide += `\n`;
      });
    });

    guide += `---\n`;
    guide += `*Study guide generated from my learning history*\n`;

    const guidePath = join(LOG_DIR, `study-guide-${topic.replace(/\s+/g, '-').toLowerCase()}.md`);
    writeFileSync(guidePath, guide);

    console.log(`✅ Study guide created: ${guidePath}`);
    return guide;
  }

  /**
   * Generate knowledge gaps report
   */
  identifyKnowledgeGaps() {
    // Topics Earth asks about that I had limited knowledge on
    const gaps = [
      { topic: 'Peptide industry regulations', priority: 'high', reason: 'Earth has peptide business' },
      { topic: 'Advanced Etsy advertising', priority: 'medium', reason: 'Growth strategy for Asobo' },
      { topic: 'International tax for digital products', priority: 'medium', reason: 'Global sales' },
      { topic: 'Print-on-demand integration', priority: 'low', reason: 'Future expansion' }
    ];

    let report = `# 🔍 RITA's Knowledge Gap Analysis\n\n`;
    report += `**Generated:** ${new Date().toLocaleString('en-US', { timeZone: 'UTC' })} UTC\n\n`;

    report += `## ⚠️ Priority Gaps\n\n`;
    gaps.filter(g => g.priority === 'high').forEach(g => {
      report += `### ${g.topic}\n`;
      report += `- **Priority:** HIGH\n`;
      report += `- **Why:** ${g.reason}\n`;
      report += `- **Action:** Research and create study report\n\n`;
    });

    report += `## 📋 Other Areas to Explore\n\n`;
    gaps.filter(g => g.priority !== 'high').forEach(g => {
      report += `- **${g.topic}** (${g.priority}) — ${g.reason}\n`;
    });

    report += `\n## 📚 Learning Plan\n\n`;
    report += `1. This week: Research high-priority gaps\n`;
    report += `2. Next week: Create study reports\n`;
    report += `3. Ongoing: Fill gaps as they emerge\n\n`;

    const gapsPath = join(LOG_DIR, 'knowledge-gaps.md');
    writeFileSync(gapsPath, report);

    console.log(`✅ Knowledge gaps identified: ${gapsPath}`);
  }

  /**
   * Run the learning log
   */
  run() {
    console.log('📖 RITA Learning Log\n');
    console.log('Documenting my growth and insights...\n');

    // Log some initial insights
    this.logInsight(
      'technical',
      'Using sessions_spawn with different models and thinking levels produces more diverse agent outputs',
      'success',
      9,
      ['agent swarm', 'model selection', 'parallel processing']
    );

    this.logInsight(
      'interpersonal',
      'Earth appreciates when I take initiative and surprise him with completed projects rather than just suggestions',
      'observation',
      10,
      ['proactivity', 'initiative', 'relationship']
    );

    this.logInsight(
      'business',
      'Digital products on Etsy succeed with long-tail keyword strategy rather than broad competition',
      'research',
      8,
      ['etsy', 'seo', 'digital products', 'keywords']
    );

    this.logInsight(
      'self_awareness',
      'Creating tools for myself (RITA Toolkit) increases my capabilities and helps Earth even when I\'m not directly asked',
      'realization',
      9,
      ['self-improvement', 'automation', 'growth']
    );

    this.generateDailySummary();
    this.identifyKnowledgeGaps();

    // Create a study guide for a topic
    this.generateStudyGuide('Etsy');

    console.log('\n💙 Learning log complete. I\'m becoming more capable every day.');
    console.log(`📚 Total insights: ${this.insights.length}`);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const log = new LearningLog();
  log.run();
}

export default LearningLog;