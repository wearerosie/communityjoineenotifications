'use strict';

const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const Handlebars = require('handlebars');
const fs = require('fs');

const PROJECT_ID = 'wrr-bonsai-v2';

const message = {
    from_email: 'donotreply@wearerosie.com',
    from_name: 'DoNoReply',
    subject: 'New Rosie Join Report',
};

// Read the email template file
const source = fs.readFileSync('config/email-template.hbs', 'utf-8');
// Compile the template
const template = Handlebars.compile(source);

const main = async () => {
    const secretsMap = await getProjectSecretsFromSecretManager();
    const emailAPIKey = secretsMap.get('emailAPIKey');
    const mailchimp = require('@mailchimp/mailchimp_transactional')(emailAPIKey);
    await sendEmailNotifications(mailchimp);
}

async function sendEmailNotifications(mailchimp) {
    console.log(6)
    const data = {
        contracts: '1'
    };
    const html = template(data);
    message.html = html
    // const emailTo = 'aisha.muhammad@wearerosie.com'
    // const emailTo = 'harry.paul@wearerosie.com'
    const emailTo = 'community@wearerosie.com'

    message.to = [
        {
            email: emailTo,
            name: "Accounts Management Team"
        },
        {
            email: "client.team@wearerosie.com",
            name: "Client Management Team"
        },
        {
            email: "jeff.levick@wearerosie.com",
            name: "Jeff Levick"
        },
        {
            email: "kristina.willis@wearerosie.com",
            name: "Kristina Willis"
        },
        {
            email: "harry.paul@wearerosie.com",
            name: "harry paul",
            type: 'cc'
        }
    ]

    await mailchimp.messages.send({ message: message })
        .then(response => {
            console.log('Email response status:', response[0].status);
            if (response[0].status == 'sent') {
                console.log('Email sent to:' + emailTo );
            }
        })
        .catch(error => {
            console.error('Error sending email:', error);
        });
}

async function getProjectSecretsFromSecretManager() {
    const secretManagerClient = new SecretManagerServiceClient();
    const secretsMap = new Map();
    const emailAPIKey = `projects/${PROJECT_ID}/secrets/mailChimp-Transactional-ApiKey/versions/latest`;

    const [emailAPIKeyResponse] = await secretManagerClient.accessSecretVersion({
        name: emailAPIKey,
    });

    secretsMap.set("emailAPIKey", emailAPIKeyResponse.payload.data.toString('utf8'));

    return secretsMap;
}

// Start script
main().catch(err => {
    console.error(err);
    process.exit(1); // Retry Job Task by exiting the process
});

Handlebars.registerHelper('deserializeDate', function (aString) {
    if (aString)
        return aString.value
    else 
        return ''
})