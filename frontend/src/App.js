import React, { useState } from "react";
import  { Placeholder, Grid, Divider, Header, Input, Button } from "semantic-ui-react";
import CopyToClipboard from "react-copy-to-clipboard";

function App() {

  const [userInput, setUserInput] = useState("");
  const [shortenedLink, setShortenedLink] = useState("");

  const shortenURL = async (url) => {
    await fetch("https://dd-url.web.app/shorten", {
      method: "POST",
      body: JSON.stringify({
        long: url
      })
    })
    .then((response) => response.text())
    .then((short) => setShortenedLink(short));
  }

  return (
    <Grid padded centered>
      <Grid.Row>
        <Header size="huge">
          dd-url.web.app/
          <Header.Subheader>
            Shorten those long URLs
          </Header.Subheader>
        </Header>
      </Grid.Row>
      <Divider></Divider>
      <Grid.Row>
        <Input type='text' action>
          <input value={userInput} onChange={(e) => {setUserInput(e.target.value)}}/>
          <Button onClick={() => shortenURL(userInput)}>Shorten</Button>
        </Input>
      </Grid.Row>
      <Grid.Row>
        <Header>
          {shortenedLink}
        </Header>
      </Grid.Row>
      <Grid.Row>
        <CopyToClipboard text={shortenedLink}>
          <Button disabled={shortenedLink===""}>Copy URL to Clipboard</Button>
        </CopyToClipboard>
      </Grid.Row>
    </Grid>
  );
}

export default App;
