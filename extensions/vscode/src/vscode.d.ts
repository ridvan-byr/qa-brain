declare module 'vscode' {
  export class Uri {
    fsPath: string;
    static file(path: string): Uri;
  }

  export class Position {
    constructor(line: number, character: number);
    line: number;
    character: number;
  }

  export class Range {
    constructor(start: Position, end: Position);
    start: Position;
    end: Position;
  }

  export class Selection extends Range {
    isEmpty: boolean;
  }

  export enum DiagnosticSeverity {
    Error = 0,
    Warning = 1,
    Information = 2,
    Hint = 3
  }

  export class Diagnostic {
    constructor(range: Range, message: string, severity?: DiagnosticSeverity);
    source?: string;
    code?: string;
  }

  export class CodeLens {
    constructor(range: Range, command?: Command);
  }

  export interface Command {
    title: string;
    command: string;
    arguments?: any[];
  }

  export interface Disposable {
    dispose(): any;
  }

  export interface TextLine {
    text: string;
  }

  export interface TextDocument {
    uri: Uri;
    fileName: string;
    languageId: string;
    lineCount: number;
    getText(range?: Range): string;
    lineAt(line: number): TextLine;
  }

  export interface TextEditor {
    document: TextDocument;
    selection: Selection;
  }

  export interface DiagnosticCollection {
    set(uri: Uri, diagnostics: Diagnostic[]): void;
    delete(uri: Uri): void;
    clear(): void;
    dispose(): void;
  }

  export interface OutputChannel {
    appendLine(value: string): void;
    clear(): void;
    show(preserveFocus?: boolean): void;
    dispose(): void;
  }

  export interface StatusBarItem {
    text: string;
    tooltip?: string;
    command?: string;
    show(): void;
    hide(): void;
    dispose(): void;
  }

  export interface CancellationToken {
    isCancellationRequested: boolean;
  }

  export interface Progress<T> {
    report(value: T): void;
  }

  export interface ProgressOptions {
    location: any;
    title?: string;
    cancellable?: boolean;
  }

  export interface WorkspaceFolder {
    uri: Uri;
    name: string;
  }

  export interface ExtensionContext {
    subscriptions: Disposable[];
    globalStorageUri: Uri;
  }

  export interface CodeLensProvider {
    provideCodeLenses(document: TextDocument): CodeLens[] | Thenable<CodeLens[]>;
  }

  export const StatusBarAlignment: {
    Left: number;
    Right: number;
  };

  export const ProgressLocation: {
    Notification: any;
  };

  export const window: {
    activeTextEditor?: TextEditor;
    createOutputChannel(name: string): OutputChannel;
    createStatusBarItem(alignment?: number, priority?: number): StatusBarItem;
    showInformationMessage(message: string): Thenable<string | undefined>;
    showWarningMessage(message: string): Thenable<string | undefined>;
    showErrorMessage(message: string): Thenable<string | undefined>;
    withProgress<R>(options: ProgressOptions, task: (progress: Progress<{ message?: string; increment?: number }>, token: CancellationToken) => Thenable<R>): Thenable<R>;
    showTextDocument(document: TextDocument, options?: any): Thenable<TextEditor>;
  };

  export const workspace: {
    workspaceFolders?: WorkspaceFolder[];
    getConfiguration(section?: string): {
      get<T>(key: string, defaultValue: T): T;
    };
    createFileSystemWatcher(globPattern: string): Disposable;
    openTextDocument(uri: Uri): Thenable<TextDocument>;
    onDidSaveTextDocument(listener: (document: TextDocument) => any): Disposable;
    findFiles(include: string, exclude?: string, maxResults?: number): Thenable<Uri[]>;
  };

  export const languages: {
    createDiagnosticCollection(name: string): DiagnosticCollection;
    registerCodeLensProvider(selector: any, provider: CodeLensProvider): Disposable;
  };

  export const commands: {
    registerCommand(command: string, callback: (...args: any[]) => any): Disposable;
    executeCommand<T = unknown>(command: string, ...rest: any[]): Thenable<T>;
  };
}
