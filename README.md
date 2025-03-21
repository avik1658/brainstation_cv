# BrainStation23 CV Site

This CV management system is a web application where employees can create and manage their profiles, including skills, education, and projects etc.They can easily reorder data using drag-and-drop. There is validation for every form data. Admins can view and edit employee details, download multiple CVs, and send notifications.


## Clone the project

```
git clone https://github.com/avik1658/brainstation_cv
```

## Install Dependencies

```
npm install
```

## Set Up URL

In axios.ts, set up the url according to needs

```
const url = "your_url";
```

## Set Up Timeouts for api calls
In axios.ts, set up the api timeout duration according to needs

```
const normalTimeout = 5000;
const pdfTimeout = 10000;
const excelTimeout = 10000;
```

## API Keys

In axios.ts, set up the token in both axiosInstance1 and axiosInstance2. It is taking token from localstorage by default

```
config.headers.Authorization = `Bearer ${token}`;
```

## Run the project in development mode

```
npm run dev
```


## Generate production build
It will create a folder named 'dist' in the project which will include all the files needed for deployment

```
npm run build
```

## Deployment

Deploy the project according to the hosting service used