import { describe, expect, it } from "vitest";
import { detectDocumentMime, validateDocumentUpload, DocumentValidationError } from "../../src/lib/portal/documentValidation";

describe("detectDocumentMime", () => {
  it("recognizes a PDF by its magic bytes", () => {
    const bytes = Buffer.concat([Buffer.from("%PDF-1.4"), Buffer.alloc(10)]);
    expect(detectDocumentMime(bytes)).toBe("application/pdf");
  });

  it("recognizes a PNG by its magic bytes", () => {
    const bytes = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0]);
    expect(detectDocumentMime(bytes)).toBe("image/png");
  });

  it("recognizes a JPEG by its magic bytes", () => {
    const bytes = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0]);
    expect(detectDocumentMime(bytes)).toBe("image/jpeg");
  });

  it("recognizes a DOCX (zip) by its magic bytes", () => {
    const bytes = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0, 0]);
    expect(detectDocumentMime(bytes)).toBe("application/vnd.openxmlformats-officedocument.wordprocessingml.document");
  });

  it("returns null for a file whose declared extension lies about its content", () => {
    // A plain text file renamed to look like a PDF — magic bytes don't match.
    const bytes = Buffer.from("just some text pretending to be a pdf");
    expect(detectDocumentMime(bytes)).toBeNull();
  });

  it("returns null for an empty buffer", () => {
    expect(detectDocumentMime(Buffer.alloc(0))).toBeNull();
  });
});

describe("validateDocumentUpload", () => {
  it("accepts a valid small PDF", () => {
    const bytes = Buffer.concat([Buffer.from("%PDF-1.4"), Buffer.alloc(100)]);
    const result = validateDocumentUpload(bytes);
    expect(result.mime).toBe("application/pdf");
    expect(result.size).toBe(bytes.length);
  });

  it("rejects an empty file", () => {
    expect(() => validateDocumentUpload(Buffer.alloc(0))).toThrow(DocumentValidationError);
  });

  it("rejects a file over 10 MB even if it has a valid PDF header", () => {
    const bytes = Buffer.concat([Buffer.from("%PDF-1.4"), Buffer.alloc(10 * 1024 * 1024 + 1)]);
    expect(() => validateDocumentUpload(bytes)).toThrow(/10 MB/);
  });

  it("rejects an unrecognized file type regardless of its claimed extension", () => {
    const bytes = Buffer.from("#!/bin/sh\necho hi\n");
    expect(() => validateDocumentUpload(bytes)).toThrow(/Only PDF, PNG, JPG, and DOCX/);
  });
});
