# Citation Generator API

A simple API to generate formatted citations using CSL styles and CrossRef data.

## Setup

1. **Install Dependencies:**

   ```bash
   npm install

2. **Start the Server:**

    ```bash
    npm start
    ```

3. **Usage:**

    - Make a `GET` request to `/citations` endpoint with the following query parameters:
      - `style`: The CSL style to use for formatting the citation (e.g., `apa`, `mla`, `chicago-fullnote-bibliography`).
      - `doi`: The DOI of the article to generate the citation for.
    
    Example request:
    ```bash
    GET /citations?style=apa&doi=10.1234/abcd1234
    ```

4. **Contributing:**

    Contributions are welcome! If you have any suggestions or improvements, please open an issue or submit a pull request.


































