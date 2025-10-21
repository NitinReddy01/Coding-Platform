
export const downloadSampleTestCases = () => {
  // Sample test cases content
  const samples = [
    {
      name: '1.in',
      content: '5 3',
      description: 'Input: two numbers separated by space',
    },
    {
      name: '1.out',
      content: '8',
      description: 'Output: sum of the two numbers',
    },
    {
      name: '2.in',
      content: '10 7',
      description: 'Input: another pair of numbers',
    },
    {
      name: '2.out',
      content: '17',
      description: 'Output: their sum',
    },
    {
      name: 'README.txt',
      content: `Test Case File Format
=====================

This is a sample format for bulk uploading test cases.

File Naming Convention:
- Input files: {number}.in (e.g., 1.in, 2.in, 3.in)
- Output files: {number}.out (e.g., 1.out, 2.out, 3.out)

Rules:
1. Each input file must have a corresponding output file with the same number
2. Files are paired automatically by their number
3. Numbers determine the order of test cases
4. You can upload any number of test case pairs

Example:
- 1.in contains the input for test case 1
- 1.out contains the expected output for test case 1
- 2.in contains the input for test case 2
- 2.out contains the expected output for test case 2

File Contents:
- Input files contain exactly what will be fed to the program via stdin
- Output files contain exactly what the program should output to stdout
- Whitespace and newlines matter!

Tips:
- Use simple text editors (not Word/Pages)
- Ensure no extra whitespace at the end of files
- Use UTF-8 encoding
- Test your test cases with your own solution first

After uploading:
- You can mark which test cases should be visible to users (samples)
- You can add explanations for sample test cases
- You can reorder test cases if needed
`,
    },
  ];

  // Since we can't create actual ZIP files in the browser without a library,
  // we'll download files individually or create a combined text file
  downloadAsMultipleFiles(samples);
};

/**
 * Downloads multiple files sequentially
 */
const downloadAsMultipleFiles = (
  files: Array<{ name: string; content: string; description?: string }>
) => {
  files.forEach((file, index) => {
    setTimeout(() => {
      const blob = new Blob([file.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, index * 100); // Stagger downloads to avoid browser blocking
  });
};

/**
 * Alternative: Download as a single combined text file with instructions
 */
export const downloadSampleAsText = () => {
  const content = `SAMPLE TEST CASE FORMAT
========================

Below are sample test case files. Copy the content between the markers
into separate files with the specified names.

===== FILE: 1.in =====
5 3
===== END FILE =====

===== FILE: 1.out =====
8
===== END FILE =====

===== FILE: 2.in =====
10 7
===== END FILE =====

===== FILE: 2.out =====
17
===== END FILE =====

INSTRUCTIONS:
1. Create files named: 1.in, 1.out, 2.in, 2.out, etc.
2. Copy the content between the markers into each file
3. Input files (.in) contain what goes into the program
4. Output files (.out) contain what the program should produce
5. File numbers must match (1.in pairs with 1.out)
6. Upload all files together using the bulk upload feature

TIPS:
- Numbers determine the test case order
- You can have as many test cases as needed
- Whitespace and newlines are important!
- Use UTF-8 text encoding
- Avoid extra spaces at the end of lines
`;

  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'test-case-format-sample.txt';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Generates downloadable sample files as data URLs
 * Useful for preview before download
 */
export const generateSampleDataUrls = (): Array<{ name: string; url: string; size: number }> => {
  const samples = [
    { name: '1.in', content: '5 3' },
    { name: '1.out', content: '8' },
    { name: '2.in', content: '10 7' },
    { name: '2.out', content: '17' },
  ];

  return samples.map((sample) => {
    const blob = new Blob([sample.content], { type: 'text/plain' });
    return {
      name: sample.name,
      url: URL.createObjectURL(blob),
      size: blob.size,
    };
  });
};
