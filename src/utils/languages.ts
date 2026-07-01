/* ============================================
   Language Configurations for CodeSphere AI
   Maps languages to Judge0 IDs, extensions, icons, and default code
   ============================================ */

export interface LanguageConfig {
  id: string;
  name: string;
  judge0Id: number;
  extension: string;
  monacoLang: string;
  icon: string;
  color: string;
  defaultCode: string;
}

export const languages: Record<string, LanguageConfig> = {
  javascript: {
    id: 'javascript',
    name: 'JavaScript',
    judge0Id: 63,
    extension: '.js',
    monacoLang: 'javascript',
    icon: '⚡',
    color: '#F7DF1E',
    defaultCode: `// CodeSphere AI — JavaScript
// Welcome to the future of collaborative development!

function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// Calculate first 10 Fibonacci numbers
for (let i = 0; i < 10; i++) {
  console.log(\`F(\${i}) = \${fibonacci(i)}\`);
}

console.log("\\n🚀 Happy coding with CodeSphere AI!");
`,
  },
  typescript: {
    id: 'typescript',
    name: 'TypeScript',
    judge0Id: 74,
    extension: '.ts',
    monacoLang: 'typescript',
    icon: '🔷',
    color: '#3178C6',
    defaultCode: `// CodeSphere AI — TypeScript

interface Developer {
  name: string;
  languages: string[];
  experience: number;
}

function greet(dev: Developer): string {
  return \`Hello, \${dev.name}! You know \${dev.languages.length} languages.\`;
}

const developer: Developer = {
  name: "CodeSphere User",
  languages: ["TypeScript", "React", "Node.js"],
  experience: 3
};

console.log(greet(developer));
console.log("🚀 TypeScript is awesome!");
`,
  },
  python: {
    id: 'python',
    name: 'Python',
    judge0Id: 71,
    extension: '.py',
    monacoLang: 'python',
    icon: '🐍',
    color: '#3776AB',
    defaultCode: `# CodeSphere AI — Python
# Welcome to the future of collaborative development!

def quicksort(arr):
    """Elegant quicksort implementation"""
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quicksort(left) + middle + quicksort(right)

# Demo
numbers = [64, 34, 25, 12, 22, 11, 90]
print(f"Original: {numbers}")
print(f"Sorted:   {quicksort(numbers)}")
print("\\n🚀 Happy coding with CodeSphere AI!")
`,
  },
  java: {
    id: 'java',
    name: 'Java',
    judge0Id: 62,
    extension: '.java',
    monacoLang: 'java',
    icon: '☕',
    color: '#ED8B00',
    defaultCode: `// CodeSphere AI — Java

public class Main {
    public static void main(String[] args) {
        System.out.println("🚀 Welcome to CodeSphere AI!");
        
        int[] numbers = {64, 34, 25, 12, 22, 11, 90};
        System.out.print("Original: ");
        printArray(numbers);
        
        bubbleSort(numbers);
        System.out.print("Sorted:   ");
        printArray(numbers);
    }
    
    static void bubbleSort(int[] arr) {
        int n = arr.length;
        for (int i = 0; i < n - 1; i++) {
            for (int j = 0; j < n - i - 1; j++) {
                if (arr[j] > arr[j + 1]) {
                    int temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                }
            }
        }
    }
    
    static void printArray(int[] arr) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < arr.length; i++) {
            sb.append(arr[i]);
            if (i < arr.length - 1) sb.append(", ");
        }
        sb.append("]");
        System.out.println(sb.toString());
    }
}
`,
  },
  cpp: {
    id: 'cpp',
    name: 'C++',
    judge0Id: 54,
    extension: '.cpp',
    monacoLang: 'cpp',
    icon: '⚙️',
    color: '#00599C',
    defaultCode: `// CodeSphere AI — C++
#include <iostream>
#include <vector>
#include <algorithm>

int main() {
    std::cout << "🚀 Welcome to CodeSphere AI!" << std::endl;
    
    std::vector<int> numbers = {64, 34, 25, 12, 22, 11, 90};
    
    std::cout << "Original: ";
    for (int n : numbers) std::cout << n << " ";
    std::cout << std::endl;
    
    std::sort(numbers.begin(), numbers.end());
    
    std::cout << "Sorted:   ";
    for (int n : numbers) std::cout << n << " ";
    std::cout << std::endl;
    
    return 0;
}
`,
  },
  c: {
    id: 'c',
    name: 'C',
    judge0Id: 50,
    extension: '.c',
    monacoLang: 'c',
    icon: '🔧',
    color: '#A8B9CC',
    defaultCode: `/* CodeSphere AI — C */
#include <stdio.h>

int main() {
    printf("🚀 Welcome to CodeSphere AI!\\n");
    
    int numbers[] = {64, 34, 25, 12, 22, 11, 90};
    int n = sizeof(numbers) / sizeof(numbers[0]);
    
    printf("Original: ");
    for (int i = 0; i < n; i++) printf("%d ", numbers[i]);
    printf("\\n");
    
    // Bubble sort
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (numbers[j] > numbers[j + 1]) {
                int temp = numbers[j];
                numbers[j] = numbers[j + 1];
                numbers[j + 1] = temp;
            }
        }
    }
    
    printf("Sorted:   ");
    for (int i = 0; i < n; i++) printf("%d ", numbers[i]);
    printf("\\n");
    
    return 0;
}
`,
  },
  go: {
    id: 'go',
    name: 'Go',
    judge0Id: 60,
    extension: '.go',
    monacoLang: 'go',
    icon: '🔵',
    color: '#00ADD8',
    defaultCode: `// CodeSphere AI — Go
package main

import "fmt"

func main() {
    fmt.Println("🚀 Welcome to CodeSphere AI!")
    
    numbers := []int{64, 34, 25, 12, 22, 11, 90}
    fmt.Println("Original:", numbers)
    
    // Simple sort
    for i := 0; i < len(numbers); i++ {
        for j := i + 1; j < len(numbers); j++ {
            if numbers[j] < numbers[i] {
                numbers[i], numbers[j] = numbers[j], numbers[i]
            }
        }
    }
    
    fmt.Println("Sorted:  ", numbers)
}
`,
  },
  rust: {
    id: 'rust',
    name: 'Rust',
    judge0Id: 73,
    extension: '.rs',
    monacoLang: 'rust',
    icon: '🦀',
    color: '#CE422B',
    defaultCode: `// CodeSphere AI — Rust
fn main() {
    println!("🚀 Welcome to CodeSphere AI!");
    
    let mut numbers = vec![64, 34, 25, 12, 22, 11, 90];
    println!("Original: {:?}", numbers);
    
    numbers.sort();
    println!("Sorted:   {:?}", numbers);
    
    // Pattern matching demo
    let language = "Rust";
    match language {
        "Rust" => println!("Memory safe and blazingly fast! 🦀"),
        _ => println!("Also great!"),
    }
}
`,
  },
  ruby: {
    id: 'ruby',
    name: 'Ruby',
    judge0Id: 72,
    extension: '.rb',
    monacoLang: 'ruby',
    icon: '💎',
    color: '#CC342D',
    defaultCode: `# CodeSphere AI — Ruby
puts "🚀 Welcome to CodeSphere AI!"

numbers = [64, 34, 25, 12, 22, 11, 90]
puts "Original: #{numbers}"
puts "Sorted:   #{numbers.sort}"

# Ruby elegance
5.times { |i| puts "Iteration #{i + 1}" }
`,
  },
  php: {
    id: 'php',
    name: 'PHP',
    judge0Id: 68,
    extension: '.php',
    monacoLang: 'php',
    icon: '🐘',
    color: '#777BB4',
    defaultCode: `<?php
// CodeSphere AI — PHP
echo "🚀 Welcome to CodeSphere AI!\\n";

$numbers = [64, 34, 25, 12, 22, 11, 90];
echo "Original: " . implode(", ", $numbers) . "\\n";

sort($numbers);
echo "Sorted:   " . implode(", ", $numbers) . "\\n";
?>
`,
  },
  swift: {
    id: 'swift',
    name: 'Swift',
    judge0Id: 83,
    extension: '.swift',
    monacoLang: 'swift',
    icon: '🍎',
    color: '#FA7343',
    defaultCode: `// CodeSphere AI — Swift
import Foundation

print("🚀 Welcome to CodeSphere AI!")

var numbers = [64, 34, 25, 12, 22, 11, 90]
print("Original: \\(numbers)")

numbers.sort()
print("Sorted:   \\(numbers)")
`,
  },
  kotlin: {
    id: 'kotlin',
    name: 'Kotlin',
    judge0Id: 78,
    extension: '.kt',
    monacoLang: 'kotlin',
    icon: '🟣',
    color: '#7F52FF',
    defaultCode: `// CodeSphere AI — Kotlin
fun main() {
    println("🚀 Welcome to CodeSphere AI!")
    
    val numbers = listOf(64, 34, 25, 12, 22, 11, 90)
    println("Original: $numbers")
    println("Sorted:   \${numbers.sorted()}")
}
`,
  },
  sql: {
    id: 'sql',
    name: 'SQL',
    judge0Id: 82,
    extension: '.sql',
    monacoLang: 'sql',
    icon: '🗄️',
    color: '#4479A1',
    defaultCode: `-- CodeSphere AI — SQL
SELECT 'Hello from CodeSphere AI!' AS greeting;
`,
  },
  html: {
    id: 'html',
    name: 'HTML',
    judge0Id: 0,
    extension: '.html',
    monacoLang: 'html',
    icon: '🌐',
    color: '#E34F26',
    defaultCode: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>CodeSphere AI</title>
    <style>
        body { font-family: system-ui; background: #050816; color: #F1F5F9; display: flex; align-items: center; justify-content: center; height: 100vh; }
        h1 { background: linear-gradient(135deg, #6366F1, #8B5CF6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    </style>
</head>
<body>
    <h1>🚀 Welcome to CodeSphere AI!</h1>
</body>
</html>
`,
  },
  css: {
    id: 'css',
    name: 'CSS',
    judge0Id: 0,
    extension: '.css',
    monacoLang: 'css',
    icon: '🎨',
    color: '#1572B6',
    defaultCode: `/* CodeSphere AI — CSS */
:root {
  --primary: #6366F1;
  --accent: #8B5CF6;
}

.container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #050816;
}
`,
  },
  json: {
    id: 'json',
    name: 'JSON',
    judge0Id: 0,
    extension: '.json',
    monacoLang: 'json',
    icon: '📋',
    color: '#292929',
    defaultCode: `{
  "app": "CodeSphere AI",
  "version": "1.0.0",
  "tagline": "The Future of Collaborative Development"
}
`,
  },
  markdown: {
    id: 'markdown',
    name: 'Markdown',
    judge0Id: 0,
    extension: '.md',
    monacoLang: 'markdown',
    icon: '📝',
    color: '#083FA1',
    defaultCode: `# CodeSphere AI

> The Future of Collaborative Development

## Features
- 🚀 Cloud-based code editor
- 🤖 AI-powered assistance
- 👥 Real-time collaboration
- 📊 Analytics dashboard
`,
  },
};

export const getLanguageById = (id: string): LanguageConfig | undefined => languages[id];

export const getLanguageByExtension = (ext: string): LanguageConfig | undefined =>
  Object.values(languages).find((lang) => lang.extension === ext);

export const executableLanguages = Object.values(languages).filter((lang) => lang.judge0Id > 0);
