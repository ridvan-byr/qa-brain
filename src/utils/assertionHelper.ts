export function hasAssertionSignal(content: string): boolean {
  const assertionPatterns = [
    /\bexpect\s*\(/,
    /\bassert\w*\s*\./,
    /\bassert\w*\s*\(/,
    /\bshould\s*\./,
    /\bchai\.expect\s*\(/,
    /\bEnsure\.that\s*\(/,
    /\bCheck\.whether\s*\(/,
    /\bactor\.attemptsTo\s*\(/,
    /\battemptsTo\s*\(/,
    /\bseeIf\s*\(/,
    /\bexpectationTo\w+\s*\(/,
    /\btoEqual\s*\(/,
    /\btoBe\s*\(/,
    /\btoContain\s*\(/,
    /\btoHave\w+\s*\(/,
    /\bresponse\.(?:ok|status)\s*\(/,
    /\brequest\.(?:get|post|put|patch|delete)\s*\(/,
    /\bshortest\s*\(/,
    /\btest\.(?:skip|fixme|fail)\s*\(/,
    /\beyes\.check\s*\(/,
    /\bpercySnapshot\s*\(/,
    /\.\b(?:validate|verify|assert)\w*\s*\(/,
  ];
  return assertionPatterns.some(pattern => pattern.test(content));
}
