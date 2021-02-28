# GND-CTRL 

GND-CTRL is an experimental web app for controlling the [COM-GND Espresso](https://github.com/COM-GND/espresso) Open Source Hardware project. It connects to the COM-GND control hardware module via Bluetooth and allows for advanced shot profiling. 

This project is in alpha stage and under ongoing development - use with caution. 

GND-CTRL relies on the experimental Web Bluetooth API. The api currently has (limited support)[https://caniuse.com/web-bluetooth] and this app has developed and tested only for use with the Chrome browser. 

## Creating Custom Shot Profiles

Profiles are stored in the `/profiles` directory. Each profile is a javascript class that extends the `profile` base class. 

Because the profile file is written in javascript, the shot can be profiled with flexibility and conditional design. See the `blooming-espresso.js` file a simple example of the api. 

More information to come...


GND-CTRL is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Development
### Getting Started

First, run the development server:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.js`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.js`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.


### Using https to test the app on your local LAN.

The Bluetooth web API is only available over `https` or `localhost`.

If you want to test the app with another device  on your local LAN (such as an iphone), you will you need to create a self-signed ssl certificate for the node server. 

The `gen-ssl-cert.sh` shell script has been added to make generating certificates easier. It is based on this [tutorial](https://medium.com/responsetap-engineering/nextjs-https-for-a-local-dev-server-98bb441eabd7).

You will also need to update your hosts file (on OS X, you can find it at `/private/etc/hosts`) and add:
```
[your local lan IP] gnd-ctrl.test
```

run
```
yarn https-dev
```

And open `https://gnd-ctrl.test:3000` from any device on your LAN. 

### Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

### Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
