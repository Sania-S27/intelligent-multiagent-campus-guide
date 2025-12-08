import wikipedia

def search_wikipedia(query: str) -> str:
    """
    Searches Wikipedia for a query and returns a short summary.
    """
    try:
        summary = wikipedia.summary(query, sentences=2, auto_suggest=False)
        return f"According to Wikipedia: {summary}"
    except wikipedia.exceptions.DisambiguationError as e:
        return f"That query is too broad. Can you be more specific? (e.g., {e.options[0]})"
    except wikipedia.exceptions.PageError:
        return f"I couldn't find a Wikipedia page for '{query}'."
    except Exception as e:
        return f"I had trouble searching Wikipedia: {e}"