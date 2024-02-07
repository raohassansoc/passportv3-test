let welcome_html_content = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="x-apple-disable-message-reformatting" />
    <link
      href="https://fonts.googleapis.com/css2?family=Montserrat:wght@100;200;300;400;500;600;700;800&display=swap"
      rel="stylesheet"
    />
    <link
      href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;500;700&display=swap"
      rel="stylesheet"
    />
    <style>
      html,
      body {
        margin: 0 auto !important;
        padding: 0 !important;
        font-size: 16px;
        line-height: 30px;
        background-color: #000;
        font-family: "Montserrat", sans-serif;
      }
      @import url("https://fonts.googleapis.com/css2?family=Montserrat&Roboto:wght@100;200;300;400;500;600;700;800&display=swap");
      table {
        margin: 0 auto !important;
      }
      img {
        -ms-interpolation-mode: bicubic;
      }
      a {
        text-decoration: none;
      }
      *[x-apple-data-detectors],
      .unstyle-auto-detected-links *,
      .aBn {
        border-bottom: 0 !important;
        cursor: default !important;
        color: inherit !important;
        text-decoration: none !important;
        font-size: inherit !important;
        font-family: inherit !important;
        font-weight: inherit !important;
        line-height: inherit !important;
      }
      @media only screen and (min-device-width: 320px) and (max-device-width: 374px) {
        u ~ div .email-container {
          min-width: 300px !important;
        }
      }
      @media only screen and (min-device-width: 375px) and (max-device-width: 413px) {
        u ~ div .email-container {
          min-width: 350px !important;
        }
      }
      @media only screen and (min-device-width: 414px) {
        u ~ div .email-container {
          min-width: 400px !important;
        }
      }
    </style>

    <style>
      .headding-text {
        text-align: center;
      }
      .headding-text p {
        color: #909090;
        text-align: center;
        font-family: "Roboto", sans-serif;
        font-size: 13px;
        font-style: normal;
        font-weight: 400;
        line-height: 50px;
        margin: 14px auto 0px;
        width: 90%;
        letter-spacing: 0.25px;
        border-bottom: 1px dotted #909090;
      }
      .logo-head {
        padding: 15px 9px 0px;
      }
      .logo-head img {
        width: 120px;
      }
      .heading-section {
        padding: 0rem 0rem 1rem 2rem;
      }
      .heading-section h3 {
        color: #fff;
        font-family: "Montserrat", sans-serif;
        font-size: 47px;
        font-style: normal;
        font-weight: 600;
        line-height: 130%;
        letter-spacing: -3px;
        margin: 0px;
        margin-top: -25px;
      }
      .heading-section p {
        color: #909090;
        font-family: "Montserrat", sans-serif;
        font-size: 14px;
        font-style: normal;
        font-weight: 500;
        line-height: 28px;
        margin-bottom: 0px;
        padding-top: 10px;
      }
      .heading-copy {
        padding: 0rem 2rem 2rem 2rem;
      }
      .heading-copy p {
        font-family: "Roboto", sans-serif;
        color: #909090;
        font-size: 14px;
        font-style: normal;
        font-weight: 500;
        line-height: 28px;
        margin: 0px;
      }
      .bg-color-link {
        padding: 8px 12px;
        background-color: #262626;
        border-radius: 5px;
        margin: 0.2rem 2rem 1.5rem;
      }
      .bg-color-link p {
        color: #fff;
        font-family: "Montserrat", sans-serif;
        font-size: 14px;
        font-style: normal;
        font-weight: 500;
        margin: 0px;
        line-height: 28px; /* 200% */
        letter-spacing: 0.25px;
      }
      .bg-color-link a {
        color: #b4abd5;
        font-family: "Roboto", sans-serif;
        font-size: 14px;
        font-style: normal;
        font-weight: 400;
        line-height: 28px; /* 200% */
        letter-spacing: 0.25px;
      }
      .bg-color-link img {
        margin: 6px 4px -4px;
        width: 17px;
      }
      .Click-hear {
        width: 91%;
        border-radius: 4px;
        background: #6a0bff;
        border: none;
        height: 50px;
      }
      .click-link-text p {
        color: #909090;
        font-family: Roboto;
        font-size: 14px;
        font-style: normal;
        font-weight: 400;
        line-height: 28px; /* 233.333% */
        letter-spacing: 0.25px;
        margin: 0px;
      }
      .Click-hear a {
        color: #fff;
        text-align: center;
        font-family: "Montserrat", sans-serif;
        font-size: 14px;
        font-style: normal;
        font-weight: 700;
        line-height: 28px; /* 200% */
        text-transform: uppercase;
      }
      .headding-bottom {
        text-align: center;
      }
      .headding-bottom p {
        color: #909090;
        text-align: center;
        font-family: "Roboto", sans-serif;
        font-size: 13px;
        font-style: normal;
        font-weight: 400;
        line-height: 30px;
        margin: 20px auto;
        padding-top: 12px;
        width: 90%;
        letter-spacing: 0.25px;
        border-top: 1px dotted #909090;
      }
    </style>
  </head>

  <body
    width="100%"
    style="margin: 0; padding: 0 !important; mso-line-height-rule: exactly"
  >
    <center style="width: 100%">
      <div style="max-width: 680px; margin: 50px auto" class="email-container">
        <table
          align="center"
          role="presentation"
          cellspacing="0"
          cellpadding="0"
          border="0"
          width="100%"
          style="margin: auto; background-color: #181818; overflow: hidden"
        >
          <tbody>
            <tr>
              <td class="headding-text" style="text-align: center">
                <p>
                  If you are having problems viewing this in your email browser
                  please click here
                </p>
              </td>
            </tr>
            <tr>
              <td class="logo-head" style="text-align: left">
                <img
                  src="https://s3.eu-north-1.amazonaws.com/passportv3.io/1697522537241_logo_passport.png"
                />
              </td>
            </tr>
            <tr>
              <td>
                <table
                  role="presentation"
                  cellspacing="0"
                  cellpadding="0"
                  border="0"
                  width="100%"
                >
                  <tr>
                    <td>
                      <div class="heading-section">
                        <table width="100%">
                          <tbody>
                            <tr>
                              <td align="Left">
                                <h3>Welcome to Passport App!</h3>
                                <p>
                                  Click on the button “Click here to verify” to
                                  authenticate your new account. We want you to
                                  get started as soon as possible. If by any
                                  chance you are not able to click the button we
                                  have provided, a link for you to copy and
                                  paste in your browser.
                                </p>
                              </td>
                              <td align="right">
                                <img
                                  src="https://s3.eu-north-1.amazonaws.com/passportv3.io/1697522672005_logo_passport-1.png"
                                />
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      <table width="90%">
                        <tbody>
                          <tr>
                            <td align="Left" class="click-link-text">
                              <p>Activation link</p>
                            </td>
                          </tr>
                        </tbody>
                      </table>

                      <div class="bg-color-link">
                        <table width="100%">
                          <tbody>
                            <tr>
                              <td align="Left">
                                <p>www.passportv3.io/activationlink</p>
                              </td>
                              <td align="right">
                                <img
                                  src="https://s3.eu-north-1.amazonaws.com/passportv3.io/1697522743262_copy-icon.png"
                                />
                                <a href="">Copy URL</a>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      <table width="100%">
                        <tr>
                          <td align="center">
                            <button class="Click-hear">
                              <a href="">Click here to verify</a>
                            </button>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td class="headding-bottom" style="text-align: center">
                <p>
                  If you no longer wish to recive this emails please click
                  Unsubscribe at any moment.
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </center>
  </body>
</html>
`;

let pin_update_email = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="x-apple-disable-message-reformatting" />
    <link
      href="https://fonts.googleapis.com/css2?family=Montserrat:wght@100;200;300;400;500;600;700;800&display=swap"
      rel="stylesheet"
    />
    <link
      href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;500;700&display=swap"
      rel="stylesheet"
    />
    <style>
      html,
      body {
        margin: 0 auto !important;
        padding: 0 !important;
        font-size: 16px;
        line-height: 30px;
        background-color: #000;
        font-family: "Montserrat", sans-serif;
      }
      @import url("https://fonts.googleapis.com/css2?family=Montserrat&Roboto:wght@100;200;300;400;500;600;700;800&display=swap");
      table {
        margin: 0 auto !important;
      }
      img {
        -ms-interpolation-mode: bicubic;
      }
      a {
        text-decoration: none;
      }
      *[x-apple-data-detectors],
      .unstyle-auto-detected-links *,
      .aBn {
        border-bottom: 0 !important;
        cursor: default !important;
        color: inherit !important;
        text-decoration: none !important;
        font-size: inherit !important;
        font-family: inherit !important;
        font-weight: inherit !important;
        line-height: inherit !important;
      }
      @media only screen and (min-device-width: 320px) and (max-device-width: 374px) {
        u ~ div .email-container {
          min-width: 300px !important;
        }
      }
      @media only screen and (min-device-width: 375px) and (max-device-width: 413px) {
        u ~ div .email-container {
          min-width: 350px !important;
        }
      }
      @media only screen and (min-device-width: 414px) {
        u ~ div .email-container {
          min-width: 400px !important;
        }
      }
    </style>

    <style>
      .headding-text {
        text-align: center;
      }
      .headding-text p {
        color: #909090;
        text-align: center;
        font-family: "Roboto", sans-serif;
        font-size: 13px;
        font-style: normal;
        font-weight: 400;
        line-height: 50px;
        margin: 14px auto 0px;
        width: 90%;
        letter-spacing: 0.25px;
        border-bottom: 1px dotted #909090;
      }
      .logo-head {
        padding: 30px 9px 0px;
      }
      .logo-head img {
        width: 120px;
      }
      .heading-section {
        padding: 0rem 0rem 2rem 2rem;
      }
      .heading-section h3 {
        color: #fff;
        font-family: "Montserrat", sans-serif;
        font-size: 47px;
        font-style: normal;
        font-weight: 600;
        line-height: 130%;
        letter-spacing: -3px;
        margin: 0px;
        margin-top: -25px;
      }
      .heading-section p {
        color: #909090;
        font-family: "Montserrat", sans-serif;
        font-size: 14px;
        font-style: normal;
        font-weight: 500;
        line-height: 28px;
        margin-bottom: 0px;
        padding-top: 10px;
      }
      .headding-bottom {
        text-align: center;
      }
      .headding-bottom p {
        color: #909090;
        text-align: center;
        font-family: "Roboto", sans-serif;
        font-size: 13px;
        font-style: normal;
        font-weight: 400;
        line-height: 30px;
        margin: 20px auto;
        padding-top: 12px;
        width: 90%;
        letter-spacing: 0.25px;
        border-top: 1px dotted #909090;
      }
    </style>
  </head>

  <body
    width="100%"
    style="margin: 0; padding: 0 !important; mso-line-height-rule: exactly"
  >
    <center style="width: 100%">
      <div style="max-width: 680px; margin: 50px auto" class="email-container">
        <table
          align="center"
          role="presentation"
          cellspacing="0"
          cellpadding="0"
          border="0"
          width="100%"
          style="margin: auto; background-color: #181818; overflow: hidden"
        >
          <tbody>
            <tr>
              <td class="headding-text" style="text-align: center">
                <p>
                  If you are having problems viewing this in your email browser
                  please click here
                </p>
              </td>
            </tr>
            <tr>
              <td class="logo-head" style="text-align: left">
                <img
                  src="https://s3.eu-north-1.amazonaws.com/passportv3.io/1697522537241_logo_passport.png"
                />
              </td>
            </tr>
            <tr>
              <td>
                <table
                  role="presentation"
                  cellspacing="0"
                  cellpadding="0"
                  border="0"
                  width="100%"
                >
                  <tr>
                    <td>
                      <div class="heading-section">
                        <table width="100%">
                          <tbody>
                            <tr>
                              <td width="50%">
                                <h3>Security PIN Changed.</h3>
                                <p>
                                  You have succesfully changed your password on
                                  the Passport app. Please keep it safe. But if
                                  you manage to forget it again do not hesitate
                                  to ask us for help!
                                </p>
                              </td>
                              <td width="50%">&nbsp;</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td class="headding-bottom" style="text-align: center">
                <p>
                  If you no longer wish to recive this emails please click
                  <u>Unsubscribe</u> at any moment.
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </center>
  </body>
</html>
`;

module.exports = { welcome_html_content, pin_update_email };
