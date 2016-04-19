# Albany Ticket Finder

Find outstaing parking tickets in Albany, NY. Uses data from the City of Albany's [open data portal](https://data.albanyny.gov/City-Finances/Outstanding-Parking-Tickets-04-1-16/474r-rd62). 

## Usage

* Clone this repo and install dependencies: ```npm install```
* Create a [Twilio](https://www.twilio.com/) account (if you don't have one already). Make note of your ```AccountSID``` and ```AuthToken```.
* Set up a phone number to recieve text messages.
* Invoke this script thusly:

```bash
~$ sid={your-account-sid} auth_token={your-account-auth-tokent} npm start
```

