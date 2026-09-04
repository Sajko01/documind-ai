import fitz

from app.services.text_cleaner import TextCleaner


class PdfProcessor:

    def __init__(self):
        self.text_cleaner = TextCleaner()

    def extract_text(
        self,
        file_bytes: bytes,
    ) -> tuple[str, list[dict]]:

        if not file_bytes:
            raise ValueError(
                "PDF file is empty"
            )

        if not file_bytes.startswith(b"%PDF-"):
            raise ValueError(
                "Invalid PDF file"
            )

        document = fitz.open(
            stream=file_bytes,
            filetype="pdf",
        )

        pages = []
        all_text = []

        try:

            for index, page in enumerate(
                document
            ):

                page_number = index + 1

                raw_text = page.get_text(
                    "text"
                )

                cleaned_text = (
                    self.text_cleaner.clean(
                        raw_text or ""
                    )
                )

                pages.append(
                    {
                        "page_number": page_number,
                        "text": cleaned_text,
                    }
                )

                if cleaned_text:
                    all_text.append(
                        cleaned_text
                    )

            full_text = "\n\n".join(
                all_text
            )

            return full_text, pages

        finally:
            document.close()