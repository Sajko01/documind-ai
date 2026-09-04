import re
import unicodedata


class TextCleaner:

    def clean(self, text: str) -> str:

        if not text:
            return ""

        # Normalizacija Unicode karaktera
        text = unicodedata.normalize(
            "NFKC",
            text,
        )

        # Non-breaking space
        text = text.replace(
            "\u00a0",
            " ",
        )

        # Uklanjanje zero-width karaktera
        text = re.sub(
            r"[\u200B-\u200D\uFEFF]",
            "",
            text,
        )

        # Windows newline
        text = text.replace(
            "\r\n",
            "\n",
        )

        # Mac newline
        text = text.replace(
            "\r",
            "\n",
        )

        # Uklanjanje trailing whitespace-a
        text = re.sub(
            r"[ \t]+\n",
            "\n",
            text,
        )

        # Višestruki space/tab -> jedan space
        text = re.sub(
            r"[ \t]+",
            " ",
            text,
        )

        # Više od 2 newline-a -> 2 newline-a
        text = re.sub(
            r"\n{3,}",
            "\n\n",
            text,
        )

        # Uklanjanje whitespace-a oko newline-a
        text = re.sub(
            r" *\n *",
            "\n",
            text,
        )

        # Finalni trim
        text = text.strip()

        return text