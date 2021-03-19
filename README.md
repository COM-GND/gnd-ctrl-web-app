![COM GND Logo](https://raw.githubusercontent.com/COM-GND/com-gnd-espresso/main/docs/com-gnd_logo_left-lock.svg)

# GND-CTRL 

GND-CTRL is an experimental web app for controlling the [COM-GND Espresso](https://github.com/COM-GND/espresso) Open Source Hardware project. It connects to the COM-GND control hardware module via Bluetooth and allows for advanced shot profiling. 

---
WARNING: This project is in alpha stage and under ongoing development - use with caution. 

---

GND-CTRL relies on the experimental Web Bluetooth API. The api currently has [limited support](https://caniuse.com/web-bluetooth) and this app has been developed and tested for use with the Chrome browser. On iOS, Neither Chrome nor Safari currently support Web Bluetooth, but there are a number of alternative browsers (e.g. [Webble](https://apps.apple.com/us/app/webble/id1193531073)) available and designed for this purpose.  

## Modular Hardware Approach

COM-GND Espresso is designed to provide flexibility in what hardware modules are installed. The aim is to support varying levels of espresso machine modification and easy progressive upgrades. 

The minimum required hardware is the COM-GND Base unit and the Pump Control Module. 

Current Modules
 - COM-GND Base: Serves as hub for other modules and provides bluetooth communication for pump power, pressure sensor, and target pressure values via BLE. 
 - Pump Control: Allows for control of vibration pump power level by either manual dial or app control. Enables pre-infusion and basic profiling. 
 - Pressure Sensor: Adds real-time pressure sensing. Enables true pressure profiling. 
 - Rotary Encoder: Enable manual control of pump or pressure level through a rotary control. 
 

 Future Modules
 - Temperature PID
 - Bluetooth Shot Scale

## Profiles

Profiles provide a framework for generating specific recipes. The basic profile is Time & Pressure (controlling pressure over time)
## Creating Custom Shot Profiles

Profiles are stored in the `/profiles` directory. Each profile is a javascript class that extends the `profile` base class. 

Because the profile file is written in javascript, the shot can be profiled with flexibility and conditional design. See the `blooming-espresso.js` file for a simple example of the api. 

More information to come...


GND-CTRL is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Development
### Getting Started

First, run the development server:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.


### Using https to test the app on your local LAN.

The Bluetooth web API is only available over `https` or `localhost`.

If you want to test the app with another device on your local LAN (such as an iphone), you will you need to create a self-signed ssl certificate for the node server. 

On OS X, you can follow this [tutorial](https://matthewhoelter.com/2019/10/21/how-to-setup-https-on-your-local-development-environment-localhost-in-minutes.html) to generate a set of certifcates with [mkcert](https://github.com/FiloSottile/mkcert).


Update the `https-server.js` file with your certifcate file paths and run:

```
yarn https-dev
```

Open your `.local` address (eg. https://my-notebook.local:3000) from any device on your LAN. 

---

You can start editing the page by modifying `pages/index.js`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.js`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.




### Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

### Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
