interface FileStorePort {
  get(id: string): Promise<File>
  set(id: string, file: Buffer<ArrayBuffer>, mimeType: string): Promise<string>
}