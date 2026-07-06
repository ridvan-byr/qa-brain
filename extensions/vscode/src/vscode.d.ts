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
    active: Position;
  }

  export enum DiagnosticSeverity {
    Error = 0,
    Warning = 1,
    Information = 2,
    Hint = 3
  }

  export class Diagnostic {
    constructor(range: Range, message: string, severity?: DiagnosticSeverity);
    message: string;
    severity: DiagnosticSeverity;
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
    positionAt(offset: number): Position;
  }

  export interface TextEditorEdit {
    replace(location: Position | Range | Selection, value: string): void;
    insert(location: Position, value: string): void;
    delete(location: Range | Selection): void;
  }

  export interface TextEditor {
    document: TextDocument;
    selection: Selection;
    edit(callback: (editBuilder: TextEditorEdit) => void, options?: { undoStopBefore: boolean; undoStopAfter: boolean }): Thenable<boolean>;
    revealRange(range: Range, revealType?: number): void;
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

  export class ThemeColor {
    constructor(id: string);
  }

  export class CodeAction {
    constructor(title: string, kind?: CodeActionKind);
    title: string;
    command?: Command;
    diagnostics?: Diagnostic[];
  }

  export class CodeActionKind {
    static readonly Empty: CodeActionKind;
    static readonly QuickFix: CodeActionKind;
  }

  export interface CodeActionContext {
    diagnostics: Diagnostic[];
  }

  export interface CodeActionProvider {
    provideCodeActions(
      document: TextDocument,
      range: Range | Selection,
      context: CodeActionContext,
      token: CancellationToken
    ): CodeAction[] | Thenable<CodeAction[]>;
  }

  export interface StatusBarItem {
    text: string;
    tooltip?: string;
    command?: string;
    backgroundColor?: ThemeColor;
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

  export interface Memento {
    get<T>(key: string): T | undefined;
    get<T>(key: string, defaultValue: T): T;
    update(key: string, value: any): Thenable<void>;
  }

  export interface ExtensionContext {
    subscriptions: Disposable[];
    globalStorageUri: Uri;
    workspaceState: Memento;
  }

  export interface CodeLensProvider {
    provideCodeLenses(document: TextDocument): CodeLens[] | Thenable<CodeLens[]>;
  }

  export interface Webview {
    html: string;
    options: any;
    onDidReceiveMessage: (listener: (message: any) => any) => Disposable;
    postMessage(message: any): Thenable<boolean>;
    asWebviewUri(localResource: Uri): Uri;
  }

  export interface WebviewView {
    webview: Webview;
    onDidDispose: (listener: () => any) => Disposable;
    visible: boolean;
    show(preserveFocus?: boolean): void;
  }

  export interface WebviewViewProvider {
    resolveWebviewView(
      webviewView: WebviewView,
      context: any,
      token: CancellationToken
    ): void | Thenable<void>;
  }

  export const TextEditorRevealType: {
    Default: number;
    InCenter: number;
    InCenterIfOutsideViewport: number;
    AtTop: number;
  };

  export const StatusBarAlignment: {
    Left: number;
    Right: number;
  };

  export const ProgressLocation: {
    Notification: any;
  };

  export class ThemeColor {
    constructor(id: string);
  }

  export const window: {
    activeTextEditor?: TextEditor;
    createOutputChannel(name: string): OutputChannel;
    createStatusBarItem(alignment?: number, priority?: number): StatusBarItem;
    showInformationMessage(message: string, options?: { modal?: boolean }): Thenable<string | undefined>;
    showWarningMessage(message: string): Thenable<string | undefined>;
    showErrorMessage(message: string): Thenable<string | undefined>;
    withProgress<R>(options: ProgressOptions, task: (progress: Progress<{ message?: string; increment?: number }>, token: CancellationToken) => Thenable<R>): Thenable<R>;
    showTextDocument(document: TextDocument, options?: any): Thenable<TextEditor>;
    registerWebviewViewProvider(viewId: string, provider: WebviewViewProvider, options?: any): Disposable;
  };

  export interface WorkspaceConfiguration {
    get<T>(key: string): T | undefined;
    get<T>(key: string, defaultValue: T): T;
    update(section: string, value: any, target?: ConfigurationTarget | boolean | null, overrideInLanguage?: boolean): Thenable<void>;
  }

  export enum ConfigurationTarget {
    Global = 1,
    Workspace = 2,
    WorkspaceFolder = 3
  }

  export const workspace: {
    workspaceFolders?: WorkspaceFolder[];
    getConfiguration(section?: string): WorkspaceConfiguration;
    createFileSystemWatcher(globPattern: string): Disposable;
    openTextDocument(uri: Uri): Thenable<TextDocument>;
    onDidSaveTextDocument(listener: (document: TextDocument) => any): Disposable;
    onDidCloseTextDocument(listener: (document: TextDocument) => any): Disposable;
    findFiles(include: string, exclude?: string, maxResults?: number): Thenable<Uri[]>;
  };

  export const languages: {
    createDiagnosticCollection(name: string): DiagnosticCollection;
    registerCodeLensProvider(selector: any, provider: CodeLensProvider): Disposable;
    registerCodeActionsProvider(selector: any, provider: CodeActionProvider, metadata?: { providedCodeActionKinds?: CodeActionKind[] }): Disposable;
  };

  export const commands: {
    registerCommand(command: string, callback: (...args: any[]) => any): Disposable;
    executeCommand<T = unknown>(command: string, ...rest: any[]): Thenable<T>;
  };

  export const ViewColumn: {
    Active: number;
    Beside: number;
    One: number;
    Two: number;
    Three: number;
  };

  export const env: {
    isTelemetryEnabled?: boolean;
    clipboard: {
      writeText(text: string): Thenable<void>;
    };
  };

  export class CancellationTokenSource {
    constructor();
    token: CancellationToken;
    cancel(): void;
    dispose(): void;
  }

  export class LanguageModelChatMessage {
    static User(content: string): LanguageModelChatMessage;
    static Assistant(content: string): LanguageModelChatMessage;
    static System(content: string): LanguageModelChatMessage;
  }

  export interface LanguageModelChatResponse {
    text: AsyncIterable<string>;
  }

  export interface LanguageModelChatSelector {
    vendor?: string;
    family?: string;
    version?: string;
    id?: string;
  }

  export interface LanguageModelChat {
    id: string;
    name?: string;
    vendor?: string;
    family?: string;
    sendRequest(messages: LanguageModelChatMessage[], options?: any, token?: CancellationToken): Thenable<LanguageModelChatResponse>;
  }

  export const lm: {
    selectChatModels(selector?: LanguageModelChatSelector): Thenable<LanguageModelChat[]>;
  };
}

