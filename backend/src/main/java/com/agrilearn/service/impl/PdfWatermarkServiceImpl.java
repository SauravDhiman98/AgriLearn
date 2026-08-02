package com.agrilearn.service.impl;

import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.apache.pdfbox.pdmodel.graphics.state.PDExtendedGraphicsState;
import org.apache.pdfbox.util.Matrix;
import org.springframework.stereotype.Service;

import java.awt.geom.AffineTransform;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;

@Slf4j
@Service
public class PdfWatermarkServiceImpl {

    public byte[] watermark(InputStream inputStream, String userEmail, String userName) {
        try {
            // PDFBox 3.x: read bytes first, then use Loader.loadPDF(byte[])
            byte[] pdfBytes = inputStream.readAllBytes();

            try (PDDocument doc = Loader.loadPDF(pdfBytes)) {
                PDType1Font font = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
                String line1 = userName  != null && !userName.isBlank()  ? userName  : "";
                String line2 = userEmail != null && !userEmail.isBlank() ? userEmail : "";
                String label = line1.isBlank() ? line2 : line1 + "  |  " + line2;

                for (PDPage page : doc.getPages()) {
                    float w = page.getMediaBox().getWidth();
                    float h = page.getMediaBox().getHeight();

                    PDExtendedGraphicsState gs = new PDExtendedGraphicsState();
                    gs.setNonStrokingAlphaConstant(0.12f);
                    gs.setAlphaSourceFlag(true);

                    try (PDPageContentStream cs = new PDPageContentStream(
                            doc, page, PDPageContentStream.AppendMode.APPEND, true, true)) {

                        cs.setGraphicsStateParameters(gs);
                        cs.setNonStrokingColor(0.3f, 0.3f, 0.3f);

                        float fontSize = 18f;
                        float textWidth;
                        try {
                            textWidth = font.getStringWidth(label) / 1000 * fontSize;
                        } catch (Exception e) {
                            textWidth = 200f;
                        }

                        float angle = (float) Math.toRadians(35);
                        float stepX = textWidth + 60f;
                        float stepY = 90f;
                        int   cols  = (int) (w / stepX) + 4;
                        int   rows  = (int) (h / stepY) + 4;

                        for (int row = -2; row < rows; row++) {
                            for (int col = -2; col < cols; col++) {
                                float tx = col * stepX + (row % 2 == 0 ? 0 : stepX / 2f);
                                float ty = row * stepY;

                                cs.beginText();
                                cs.setFont(font, fontSize);

                                // PDFBox 3.x: setTextMatrix requires a Matrix object
                                AffineTransform at = AffineTransform.getTranslateInstance(tx, ty);
                                at.rotate(angle);
                                cs.setTextMatrix(new Matrix(at));
                                cs.showText(label);
                                cs.endText();
                            }
                        }
                    }
                }

                ByteArrayOutputStream out = new ByteArrayOutputStream();
                doc.save(out);
                return out.toByteArray();
            }

        } catch (Exception e) {
            log.warn("PDF watermarking failed, returning original: {}", e.getMessage());
            return new byte[0];
        }
    }
}
