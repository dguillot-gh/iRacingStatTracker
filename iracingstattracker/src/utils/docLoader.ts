interface DocNode {
  content: string;
  children: Record<string, DocNode>;
}

interface DocTree {
  [key: string]: DocNode;
}

const loadDocContent = async (path: string): Promise<string> => {
  try {
    const response = await fetch(path);
    return await response.text();
  } catch (error) {
    console.error(`Error loading documentation from ${path}:`, error);
    return '';
  }
};

export const loadDocs = async (): Promise<DocTree> => {
  const docs: DocTree = {
    'Getting Started': {
      content: await loadDocContent('/docs/README.md'),
      children: {}
    },
    'Features': {
      content: '',
      children: {
        'Race Management': {
          content: await loadDocContent('/docs/features/RACE_MANAGEMENT.md'),
          children: {}
        },
        'Championship Analysis': {
          content: await loadDocContent('/docs/features/CHAMPIONSHIP_ANALYSIS.md'),
          children: {}
        }
      }
    },
    'Architecture': {
      content: await loadDocContent('/docs/ARCHITECTURE.md'),
      children: {}
    },
    'Troubleshooting': {
      content: await loadDocContent('/docs/TROUBLESHOOTING.md'),
      children: {}
    }
  };

  return docs;
}; 