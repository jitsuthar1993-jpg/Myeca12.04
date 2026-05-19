package com.myeca.smarttax

import com.myeca.smarttax.data.repository.acceptedDocumentMimeTypes
import com.myeca.smarttax.data.repository.documentMimeTypeFromName
import com.myeca.smarttax.data.repository.isAcceptedDocumentMimeType
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class MyeCaDocumentRulesTest {
    @Test
    fun `document picker uses backend accepted mime types`() {
        assertTrue(acceptedDocumentMimeTypes.contains("application/pdf"))
        assertTrue(acceptedDocumentMimeTypes.contains("image/jpeg"))
        assertTrue(acceptedDocumentMimeTypes.contains("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
        assertFalse(isAcceptedDocumentMimeType("text/plain"))
    }

    @Test
    fun `common document extensions infer accepted mime types`() {
        assertEquals("application/pdf", documentMimeTypeFromName("Form16.PDF"))
        assertEquals("image/jpeg", documentMimeTypeFromName("receipt.jpg"))
        assertEquals(
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            documentMimeTypeFromName("notice-response.docx")
        )
        assertEquals(null, documentMimeTypeFromName("notes.txt"))
    }
}
