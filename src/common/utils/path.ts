export function removeFileExtension(filePath: string) {
    const index = filePath.lastIndexOf(".");
    return index > -1 ? filePath.substring(0, index) : filePath;
}
