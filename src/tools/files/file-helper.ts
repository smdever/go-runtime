// tools/files/file-helper.ts
// Node/go-runtime scaffold for the LOKIPAI FileHelper.cs behavior.
// This module keeps the portable file/string/targeting helpers here and leaves
// conversation-specific lookup behavior to caller-supplied adapter callbacks.

    import { promises as fs } from "node:fs";
    import path from "node:path";

    export type FileTuple = [name: string, fullPath: string];

    export interface NameableFile {
    name: string;
    path: string;
    }

    export interface NamedRef {
    name?: string | null;
    Name?: string | null;
    }

    export interface ConnectorRef extends NamedRef {}

    export interface ActorRef extends NamedRef {
    aiConnector?: ConnectorRef | null;
    AIConnector?: ConnectorRef | null;
    }

    export interface InformationSection {
    target?: string;
    section?: string;
    value: string;
    }

    export interface StructuredLoadDocument {
    information: InformationSection[];
    }

    export interface WriteActorResponsesContext<TRound, TActor> {
    round: TRound;
    actor: TActor;
    filePath: string;
    getActorName: (actor: TActor) => string;
    getLastUsefulUtteranceResponse: (round: TRound, actor: TActor) => string;
    }

    export interface WriteAllResponsesContext<TConversation, TRound, TActor> {
    conversation: TConversation;
    round: TRound;
    actors: TActor[];
    filePath: string;
    reasoning?: TActor | null;
    suppressFileNarration?: boolean;
    getActorName: (actor: TActor) => string;
    getLastUsefulUtteranceResponse: (conversation: TConversation, actor: TActor) => string;
    getLastUsefulUtteranceResponseSequenceId: (round: TRound, actor: TActor) => number;
    }

    function pad2(value: number): string {
    return value.toString().padStart(2, "0");
    }

    function createTimestamp(date = new Date()): string {
    return [
        date.getFullYear().toString(),
        pad2(date.getMonth() + 1),
        pad2(date.getDate()),
        ".",
        pad2(date.getHours()),
        pad2(date.getMinutes()),
        pad2(date.getSeconds()),
    ].join("");
    }

    function normalizeExtension(extension: string): string {
    const cleaned = extension.trim().replace(/^\.+/, "");
    return cleaned.length > 0 ? cleaned : "txt";
    }

    function getName(value: NamedRef | null | undefined): string {
    return (value?.name ?? value?.Name ?? "").trim();
    }

    function getActorConnector(actor: ActorRef | null | undefined): ConnectorRef | null {
    return actor?.aiConnector ?? actor?.AIConnector ?? null;
    }

    async function directoryExists(directoryPath: string): Promise<boolean> {
    try {
        const stat = await fs.stat(directoryPath);
        return stat.isDirectory();
    } catch {
        return false;
    }
    }

    // Minimal glob matcher for current LOKIPAI filters such as *.*, *.lkf, *.txt, and *.
    // This intentionally avoids adding a runtime dependency.
    function matchesFilter(fileName: string, filter: string): boolean {
    const safeFilter = !filter || filter.trim().length === 0 ? "*.*" : filter.trim();

    if (safeFilter === "*" || safeFilter === "*.*") return true;

    const escaped = safeFilter
        .replace(/[.+^${}()|[\]\\]/g, "\\$&")
        .replace(/\*/g, ".*")
        .replace(/\?/g, ".");

    return new RegExp(`^${escaped}$`, "i").test(fileName);
    }

    function decodeXmlEntities(value: string): string {
    return value
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&amp;/g, "&");
    }

    function stripXmlTags(value: string): string {
    return decodeXmlEntities(value.replace(/<[^>]+>/g, "").trim());
    }

    function parseAttributes(rawAttributes: string): Record<string, string> {
    const attributes: Record<string, string> = {};
    const attributePattern = /([A-Za-z_][\w:.-]*)\s*=\s*("([^"]*)"|'([^']*)')/g;
    let match: RegExpExecArray | null;

    while ((match = attributePattern.exec(rawAttributes)) !== null) {
        const name = match[1];
        const value = match[3] ?? match[4] ?? "";
        attributes[name.toLowerCase()] = decodeXmlEntities(value);
    }

    return attributes;
    }

    export function addTimestampToFileName(baseFileName: string, extension: string, date = new Date()): string {
    return `${baseFileName}_${createTimestamp(date)}.${normalizeExtension(extension)}`;
    }

    export function addTimestampToPath(filePath: string, date = new Date()): string {
    const directory = path.dirname(filePath);
    const extension = path.extname(filePath);
    const fileNameWithoutExtension = path.basename(filePath, extension);
    return path.join(directory, `${fileNameWithoutExtension}.${createTimestamp(date)}${extension}`);
    }

    export async function getTemplateFilenames(directoryPath: string): Promise<FileTuple[]> {
    return getFilenames(directoryPath, "*.lkf", false);
    }

    export async function getLokiFlowFiles(directoryPath: string): Promise<NameableFile[]> {
    const files = await getTemplateFilenames(directoryPath);
    return files.map(([name, fullPath]) => ({ name, path: fullPath }));
    }

    export async function getFilenames(
    directoryPath: string,
    filter = "*.*",
    twoLevels = false,
    ): Promise<FileTuple[]> {
    if (!(await directoryExists(directoryPath))) {
        throw new Error(`The directory '${directoryPath}' does not exist.`);
    }

    const fileList: FileTuple[] = [];
    const firstLevelEntries = await fs.readdir(directoryPath, { withFileTypes: true });

    for (const entry of firstLevelEntries) {
        if (entry.isFile() && matchesFilter(entry.name, filter)) {
        fileList.push([entry.name, path.join(directoryPath, entry.name)]);
        }
    }

    if (twoLevels) {
        for (const entry of firstLevelEntries) {
        if (!entry.isDirectory()) continue;
        const subDirectory = path.join(directoryPath, entry.name);
        const secondLevelEntries = await fs.readdir(subDirectory, { withFileTypes: true });
        for (const child of secondLevelEntries) {
            if (child.isFile() && matchesFilter(child.name, filter)) {
            fileList.push([child.name, path.join(subDirectory, child.name)]);
            }
        }
        }
    }

    return fileList;
    }

    export async function getFilenamesSortedByDate(
    directoryPath: string,
    filter = "*.*",
    asc = true,
    ): Promise<FileTuple[]> {
    const files = await getFilenames(directoryPath, filter, false);
    const withStats = await Promise.all(
        files.map(async (file) => ({ file, stat: await fs.stat(file[1]) })),
    );

    withStats.sort((left, right) => {
        const diff = left.stat.birthtimeMs - right.stat.birthtimeMs;
        return asc ? diff : -diff;
    });

    return withStats.map((item) => item.file);
    }

    export function convertToFileNameCompatible(value: string | null | undefined): string {
    if (!value || value.trim().length === 0) return "";

    let result = value.trim().replace(/ /g, "-").replace(/\./g, "_");

    // Windows-invalid filename characters plus common control characters.
    result = result.replace(/[<>:"/\\|?*\u0000-\u001F]/g, "");

    let scrubbed = "";
    for (const char of result) {
        if (/^[\p{L}\p{N}\-_]$/u.test(char)) scrubbed += char;
    }

    while (scrubbed.includes("--")) scrubbed = scrubbed.replace(/--/g, "-");
    while (scrubbed.includes("__")) scrubbed = scrubbed.replace(/__/g, "_");

    scrubbed = scrubbed.replace(/^[-_]+|[-_]+$/g, "");
    if (scrubbed.length > 80) scrubbed = scrubbed.slice(0, 80);

    return scrubbed.trim();
    }

    export async function getLokiFlowJSON(projectPath: string, filename: string): Promise<string> {
    const filePath = path.join(projectPath, filename);
    return fs.readFile(filePath, "utf8");
    }

    export async function saveLokiFlowJSON(projectPath: string, filename: string, json: string): Promise<string> {
    const filePath = path.join(projectPath, filename);
    await fs.writeFile(filePath, json, "utf8");
    return filePath;
    }

    export function extractTargetFromFilename(fileName: string | null | undefined): string {
    if (!fileName || fileName.trim().length === 0) return "Default";
    return fileName.split(".")[0]?.trim() || "Default";
    }

    export function parseStructuredLoadDocument(fileContents: string): StructuredLoadDocument | null {
    if (!fileContents || !fileContents.includes("<")) return null;

    const information: InformationSection[] = [];
    const pattern = /<Information\b([^>]*)>([\s\S]*?)<\/Information>/gi;
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(fileContents)) !== null) {
        const attrs = parseAttributes(match[1] ?? "");
        information.push({
        target: attrs.target,
        section: attrs.section,
        value: stripXmlTags(match[2] ?? ""),
        });
    }

    return information.length > 0 ? { information } : null;
    }

    export function shouldProcessFileForConnector(
    connector: ConnectorRef | null | undefined,
    targetNode: string,
    structuredDoc: StructuredLoadDocument | null,
    ): boolean {
    const connectorName = getName(connector);
    if (!connectorName) return false;

    if (connectorName.toLowerCase() === targetNode.toLowerCase()) return true;

    if (!structuredDoc) return targetNode.toLowerCase() === "default";

    return structuredDoc.information.some((section) => section.target === connectorName);
    }

    export function shouldProcessFileForActor(
    actor: ActorRef | null | undefined,
    targetNode: string,
    structuredDoc: StructuredLoadDocument | null,
    ): boolean {
    const actorName = getName(actor);
    if (!actorName) return false;

    if (actorName.toLowerCase() === targetNode.toLowerCase()) return true;

    if (!structuredDoc) return targetNode.toLowerCase() === "default";

    return structuredDoc.information.some((section) => section.target === actorName);
    }

    export function extractRelevantContent(
    actorName: string,
    structuredDoc: StructuredLoadDocument | null,
    fullContent: string,
    ): string {
    if (!structuredDoc) return fullContent;

    const sections = structuredDoc.information
        .filter((section) => section.target === actorName || section.section === "Default")
        .map((section) => section.value)
        .filter((value) => value.trim().length > 0);

    return sections.length > 0 ? sections.join("\n\n") : fullContent;
    }

    export function createImportPrompt(_from: unknown, fileName: string): string {
    return `Importing file [${fileName}]:\n\n`;
    }

    export function shouldLoadUnstructuredContentForActor(
    actor: ActorRef | null | undefined,
    targetNode: string,
    actors: ActorRef[],
    ): boolean {
    if (!actor) return false;

    if (!targetNode || targetNode.trim().length === 0 || targetNode.toLowerCase() === "default") {
        return true;
    }

    const normalizedTarget = targetNode.toLowerCase();
    const targetNamesKnownActorOrConnector = actors.some((candidate) => {
        const actorName = getName(candidate).toLowerCase();
        const connectorName = getName(getActorConnector(candidate)).toLowerCase();
        return actorName === normalizedTarget || connectorName === normalizedTarget;
    });

    // Filename prefixes such as CalendarActivity.20260606.txt should behave like
    // ordinary filenames unless they match a known actor/connector target.
    if (!targetNamesKnownActorOrConnector) return true;

    return (
        getName(actor).toLowerCase() === normalizedTarget ||
        getName(getActorConnector(actor)).toLowerCase() === normalizedTarget
    );
    }

    export async function loadFilesForActors(
    filesList: FileTuple[],
    actors: ActorRef[],
    options: {
        importPath: string;
        rawMode?: boolean;
        moveToHistory?: boolean;
        from?: unknown;
    },
    ): Promise<Map<ActorRef, string[]>> {
    const promptsByActor = new Map<ActorRef, string[]>();
    const rawMode = options.rawMode ?? false;
    const moveToHistory = options.moveToHistory ?? true;
    const historyPath = path.join(options.importPath, "History");

    if (moveToHistory) await fs.mkdir(historyPath, { recursive: true });

    for (const [fileName, filePath] of filesList) {
        let fileContents = "";
        try {
        fileContents = await fs.readFile(filePath, "utf8");
        } catch {
        continue;
        }

        const targetNode = extractTargetFromFilename(fileName);
        const structuredDoc = parseStructuredLoadDocument(fileContents);
        let loadedForFile = false;

        for (const actor of actors) {
        const shouldLoadForActor = structuredDoc
            ? shouldProcessFileForConnector(getActorConnector(actor), targetNode, structuredDoc) ||
            shouldProcessFileForActor(actor, targetNode, structuredDoc)
            : shouldLoadUnstructuredContentForActor(actor, targetNode, actors);

        if (!shouldLoadForActor) continue;

        const relevantContent = extractRelevantContent(getName(actor), structuredDoc, fileContents);
        const prompt = rawMode
            ? relevantContent
            : createImportPrompt(options.from, fileName) + relevantContent;

        const existing = promptsByActor.get(actor) ?? [];
        existing.push(prompt);
        promptsByActor.set(actor, existing);
        loadedForFile = true;
        }

        if (loadedForFile && moveToHistory) {
        try {
            await fs.rename(filePath, addTimestampToPath(path.join(historyPath, fileName)));
        } catch {
            // Match C# behavior: ignore move/history issues after loading.
        }
        }
    }

    return promptsByActor;
    }

    export async function waitForFiles(
    importPath: string,
    filter = "*.*",
    options: { pollMs?: number; signal?: AbortSignal } = {},
    ): Promise<FileTuple[]> {
    const pollMs = options.pollMs ?? 5000;

    while (!options.signal?.aborted) {
        const files = await getFilenames(importPath, filter);
        if (files.length > 0) return files;
        await new Promise<void>((resolve) => setTimeout(resolve, pollMs));
    }

    return [];
    }

    export function createLoadPrompt(blurbs?: unknown): string {
    const basicPrompt =
        "The following file content has been loaded into the conversation. Treat it as relevant context for the current discourse unless later instructions say otherwise.";

    const maybePrompt = (blurbs as any)?.Conversation?.Load?.LoadPrompt;
    return typeof maybePrompt === "string" && maybePrompt.trim().length > 0 ? maybePrompt : basicPrompt;
    }

    export function getLoadPassingToBlurb(blurbs?: unknown): string {
    const loadBlurbs = (blurbs as any)?.Conversation?.Load;
    return loadBlurbs?.PassingTo ?? loadBlurbs?.LoadTo ?? "loading to";
    }

    export async function writeActorResponsesToFile<TRound, TActor>(
    context: WriteActorResponsesContext<TRound, TActor>,
    ): Promise<void> {
    const actorName = context.getActorName(context.actor);
    const response = context.getLastUsefulUtteranceResponse(context.round, context.actor);
    await fs.writeFile(context.filePath, `Responses for ${actorName}:\n${response}\n`, "utf8");
    }

    export async function writeAllResponsesToFile<TConversation, TRound, TActor>(
    context: WriteAllResponsesContext<TConversation, TRound, TActor>,
    ): Promise<void> {
    const lines: string[] = [];

    const reasoningSequenceId = context.reasoning
        ? context.getLastUsefulUtteranceResponseSequenceId(context.round, context.reasoning)
        : -1;

    let actorSequenceId = -1;
    for (const actor of context.actors) {
        const seqId = context.getLastUsefulUtteranceResponseSequenceId(context.round, actor);
        if (actorSequenceId < seqId) actorSequenceId = seqId;
    }

    const appendActor = (actor: TActor) => {
        const actorName = context.getActorName(actor);
        if (!context.suppressFileNarration) lines.push(`=== Response for ${actorName} ===`);
        lines.push(context.getLastUsefulUtteranceResponse(context.conversation, actor));
        lines.push("");
    };

    if (context.reasoning && reasoningSequenceId > actorSequenceId) {
        appendActor(context.reasoning);
    } else {
        for (const actor of context.actors) appendActor(actor);
    }

    await fs.writeFile(context.filePath, lines.join("\n"), "utf8");
    }
