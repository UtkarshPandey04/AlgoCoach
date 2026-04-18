import { useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';

const editorOptions = {
  minimap: { enabled: false },
  fontSize: 14,
  wordWrap: 'on',
  smoothScrolling: true,
  scrollBeyondLastLine: false,
  padding: { top: 18, bottom: 18 },
};

const supportedLanguages = [
  { id: 'python', label: 'Python' },
  { id: 'javascript', label: 'JavaScript' },
  { id: 'typescript', label: 'TypeScript' },
  { id: 'java', label: 'Java' },
  { id: 'cpp', label: 'C++' },
  { id: 'csharp', label: 'C#' },
  { id: 'go', label: 'Go' },
  { id: 'ruby', label: 'Ruby' },
];

function createStarterCode(problem, languageId) {
  const titleSlug = (problem?.title || 'solve_this').toLowerCase().replace(/[^a-z0-9]+/g, '_');
  const functionName = titleSlug.replace(/^_+|_+$/g, '') || 'solve_this';

  const templates = {
    python: `${problem?.starterCode || `def ${functionName}(input_data):\n    # Start here\n    pass\n`}`,
    javascript: `function ${functionName}(inputData) {\n  // Start here\n}\n\nexport default ${functionName};\n`,
    typescript: `function ${functionName}(inputData: unknown): unknown {\n  // Start here\n  return inputData;\n}\n\nexport default ${functionName};\n`,
    java: `class Solution {\n    public static void main(String[] args) {\n        // Start here\n    }\n}\n`,
    cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // Start here\n    return 0;\n}\n`,
    csharp: `using System;\n\npublic class Program {\n    public static void Main(string[] args) {\n        // Start here\n    }\n}\n`,
    go: `package main\n\nimport \"fmt\"\n\nfunc main() {\n    // Start here\n    fmt.Println(\"AlgoCoach\")\n}\n`,
    ruby: `def ${functionName}(input_data)\n  # Start here\nend\n`,
  };

  return templates[languageId] || templates.python;
}

function PracticeWorkspace({ problems = [] }) {
  const [selectedProblemId, setSelectedProblemId] = useState(problems[0]?.id || '');
  const [selectedLanguageByProblem, setSelectedLanguageByProblem] = useState({});
  const [codeByProblem, setCodeByProblem] = useState({});

  useEffect(() => {
    if (!problems.length) {
      return;
    }

    setSelectedProblemId((current) => current || problems[0].id);
    setSelectedLanguageByProblem((current) => {
      const next = { ...current };

      problems.forEach((problem) => {
        if (!next[problem.id]) {
          next[problem.id] = 'python';
        }
      });

      return next;
    });
    setCodeByProblem((current) => {
      const next = { ...current };

      problems.forEach((problem) => {
        if (!(problem.id in next)) {
          next[problem.id] = {};
        }

        supportedLanguages.forEach((language) => {
          if (!next[problem.id][language.id]) {
            next[problem.id][language.id] = createStarterCode(problem, language.id);
          }
        });

        if (!next[problem.id].python) {
          next[problem.id].python = createStarterCode(problem, 'python');
        }
      });

      return next;
    });
  }, [problems]);

  const selectedProblem = problems.find((problem) => problem.id === selectedProblemId) || problems[0];
  const selectedLanguage = selectedProblem ? selectedLanguageByProblem[selectedProblem.id] || 'python' : 'python';
  const currentCode = selectedProblem
    ? codeByProblem[selectedProblem.id]?.[selectedLanguage] || createStarterCode(selectedProblem, selectedLanguage)
    : '';
  const activeLanguage = supportedLanguages.find((language) => language.id === selectedLanguage) || supportedLanguages[0];

  const handleEditorChange = (value) => {
    if (!selectedProblem) {
      return;
    }

    setCodeByProblem((current) => ({
      ...current,
      [selectedProblem.id]: {
        ...(current[selectedProblem.id] || {}),
        [selectedLanguage]: value ?? '',
      },
    }));
  };

  const switchLanguage = (languageId) => {
    if (!selectedProblem) {
      return;
    }

    setSelectedLanguageByProblem((current) => ({
      ...current,
      [selectedProblem.id]: languageId,
    }));

    setCodeByProblem((current) => {
      const problemState = current[selectedProblem.id] || {};

      if (problemState[languageId]) {
        return current;
      }

      return {
        ...current,
        [selectedProblem.id]: {
          ...problemState,
          [languageId]: createStarterCode(selectedProblem, languageId),
        },
      };
    });
  };

  return (
    <section className="practice-layout">
      <div className="surface-card practice-problems">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Code editor</p>
            <h2>Practice queue</h2>
          </div>
        </div>

        <div className="problem-list">
          {problems.map((problem) => {
            const isActive = problem.id === selectedProblem?.id;

            return (
              <button
                key={problem.id}
                className={`problem-card ${isActive ? 'is-active' : ''}`}
                type="button"
                onClick={() => setSelectedProblemId(problem.id)}
              >
                <span className="problem-card__meta">
                  <strong>{problem.title}</strong>
                  <span>{problem.topic}</span>
                </span>
                <span className={`difficulty-badge difficulty-${problem.difficulty.toLowerCase()}`}>
                  {problem.difficulty}
                </span>
                <p>{problem.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="surface-card practice-editor">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Live workspace</p>
            <h2>{selectedProblem?.title || 'Select a problem'}</h2>
          </div>
          <div className="editor-dock">
            <span className="pill">{selectedProblem?.topic || 'Coding'}</span>
            <span className="pill pill--accent">{activeLanguage.label}</span>
          </div>
        </div>

        <div className="language-switcher" role="tablist" aria-label="Editor languages">
          {supportedLanguages.map((language) => (
            <button
              key={language.id}
              type="button"
              className={`language-chip ${language.id === selectedLanguage ? 'is-active' : ''}`}
              onClick={() => switchLanguage(language.id)}
            >
              {language.label}
            </button>
          ))}
        </div>

        <div className="editor-shell">
          <Editor
            height="460px"
            defaultLanguage={selectedLanguage}
            language={selectedLanguage}
            theme="vs-dark"
            value={currentCode}
            options={editorOptions}
            onChange={handleEditorChange}
          />
        </div>

        <div className="editor-footer">
          <div>
            <strong>Interview cue</strong>
            <p>Start with brute force, upgrade the idea step by step, and call out edge cases before you type.</p>
          </div>
          <button
            className="secondary-button"
            type="button"
            onClick={() => {
              if (!selectedProblem) {
                return;
              }

              setCodeByProblem((current) => ({
                ...current,
                [selectedProblem.id]: {
                  ...(current[selectedProblem.id] || {}),
                  [selectedLanguage]: createStarterCode(selectedProblem, selectedLanguage),
                },
              }));
            }}
          >
            Reset starter
          </button>
        </div>
      </div>
    </section>
  );
}

export default PracticeWorkspace;
