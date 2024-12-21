console.log('Content script loaded');

// 消息监听器
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('收到消息:', request.type);
  if (request.type === "EXTRACT_AND_TAILOR") {
    console.log('开始提取职位要求...');
    const requirements = extractJobRequirements();
    console.log('提取完成，结果:', requirements);
    
    setTimeout(() => {
      sendResponse({
        success: true,
        message: 'Successfully extracted requirements',
        requirements
      });
    }, 1);
    return true;
  }
});

type TechCategories = {
  languages: string[];
  frontend: string[];
  backend: string[];
  database: string[];
  cloud: string[];
  tools: string[];
};

function extractJobRequirements(): { [K in keyof TechCategories]: string[] } {
  // 获取整个页面内容
  const text = document.body.textContent || '';
  console.log('获取到页面文本，长度:', text.length);

  // 将文本转换为小写以进行匹配
  const lowerText = text.toLowerCase();
  console.log('文本预览:', lowerText.substring(0, 100));

  // 技术关键词列表
  const techKeywords: TechCategories = {
    languages: [
      'JavaScript', 'JS', 'TypeScript', 'TS',
      'Python', 'Py', 'Java', 'C++', 'Cpp',
      'C#', 'CSharp', 'Ruby', 'PHP', 'Golang', 'Go',
      'Swift', 'Kotlin', 'Scala', 'Rust'
    ],
    frontend: [
      'React', 'ReactJS', 'React.js', 'React Native',
      'Vue', 'VueJS', 'Vue.js', 'Next.js', 'NextJS',
      'Angular', 'AngularJS', 'Redux', 'Vuex',
      'HTML', 'HTML5', 'CSS', 'CSS3',
      'Sass', 'SCSS', 'Less', 'Tailwind',
      'Webpack', 'Babel', 'jQuery', 'Bootstrap'
    ],
    backend: [
      'Node', 'NodeJS', 'Node.js', 'Express',
      'Django', 'Flask', 'FastAPI',
      'Spring', 'SpringBoot', 'Spring Boot',
      'Rails', 'Laravel', 'GraphQL',
      'REST', 'RESTful', 'API'
    ],
    database: [
      'SQL', 'MySQL', 'PostgreSQL', 'Postgres',
      'MongoDB', 'Mongo', 'Redis', 'Oracle',
      'Elasticsearch', 'NoSQL', 'Database'
    ],
    cloud: [
      'AWS', 'Amazon', 'EC2', 'S3',
      'Azure', 'Microsoft Azure',
      'GCP', 'Google Cloud',
      'Docker', 'Kubernetes', 'K8s',
      'Terraform', 'Jenkins', 'CI/CD', 'CICD',
      'Cloud'
    ],
    tools: [
      'Git', 'GitHub', 'GitLab', 'Bitbucket',
      'JIRA', 'Confluence', 'Trello',
      'Agile', 'Scrum', 'Kanban',
      'Linux', 'Unix', 'Bash'
    ]
  };

  // 存储找到的技能
  const foundSkills: { [K in keyof TechCategories]: string[] } = {
    languages: [],
    frontend: [],
    backend: [],
    database: [],
    cloud: [],
    tools: []
  };

  // 遍历技术栈并在文本中查找
  Object.entries(techKeywords).forEach(([category, keywords]) => {
    keywords.forEach(keyword => {
      try {
        // 转换关键词为小写进行匹配
        const lowerKeyword = keyword.toLowerCase();

        // 创建正则表达式，匹配更宽松，不区分大小写
        const pattern = new RegExp(`\\b${lowerKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');

        // 执行匹配
        if (pattern.test(lowerText)) {
          // 在原始文本中查找原始大小写形式
          const match = text.match(new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i'));

          if (match) {
            console.log(`[${category}] 找到技术栈: ${match[0]}`);

            // 显示上下文
            const index = text.indexOf(match[0]);
            const context = text.substring(
              Math.max(0, index - 30),
              Math.min(text.length, index + match[0].length + 30)
            );
            console.log(`上下文: "...${context}..."`);

            // 保存原始大小写形式
            foundSkills[category as keyof TechCategories].push(match[0]);
          }
        }
      } catch (error) {
        console.error(`处理关键词 "${keyword}" 时出错:`, error);
      }
    });
  });

  // 去重并排序
  Object.keys(foundSkills).forEach(category => {
    foundSkills[category as keyof TechCategories] = [...new Set(foundSkills[category as keyof TechCategories])].sort();
  });

  // 打印汇总信息
  console.log('\n=== 技能要求汇总 ===\n');
  Object.entries(foundSkills).forEach(([category, skills]) => {
    if (skills.length > 0) {
      console.log(`${category}:`, skills.join(', '));
    }
  });

  return foundSkills;
}