<a href="https://danieljimenezc.github.io/makki-toast/MakkiHeader.png"><img alt="makki toast - Try it" src="https://danieljimenezc.github.io/makki-toast/MakkiHeader.png"/></a>
<div align="center">
  <img src="https://img.shields.io/npm/v/makki-toast" alt="NPM Version" />
  <img src="https://img.shields.io/bundlephobia/minzip/makki-toast" alt="Minzip size"/>
  <img src="https://img.shields.io/npm/dt/makki-toast" alt="Download" />
  <img src="https://img.shields.io/github/license/DanielJimenezC/makki-toast-package" alt="Licence" />
  
</div>
<br />
<div align="center">
  <strong>Creative makki toast.</strong>
</div>
<div align="center">Easy to use, customizable & support promise</div>
<br />
<div align="center">
  <a href="https://danieljimenezc.github.io/makki-toast/">Website</a> 
  <span> · </span>
  <a href="https://danieljimenezc.github.io/makki-toast/#/docs">Documentation</a> 
</div>
<br />
<div align="center">
  <sub>Build by <a href="https://daniel-jimenez.tech">Daniel Jimenez</a></sub>
</div>
<br />

## Features

- **Easy to use**
- **Customizable**
- **Dark mode**
- **Lightweight**
- **Accessible**

## Installation

#### With NPM

```sh
npm install makki-toast@latest
```
## Getting Started

Add the makki toast and it will take care of render the alerts. From version 2.0.0 it's for Angular 21

#### Import Makki Toast in app.ts
```jsx
import { Component } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { ToasterComponent } from 'makki-toast'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToasterComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  constructor() {}
}
```

#### Import Makki Toast in app.html
```jsx
<app-toaster></app-toaster>
<router-outlet></router-outlet>
```

#### Import Makki Toast in Component
```jsx
import { ToastService } from 'makki-toast'

constructor(
  private readonly toast: ToastService,
) {}
```

#### Info
```jsx
this.toast.info({
  title: 'Info toast',
  description: 'Info toast message',
}); 
```

#### Success
```jsx
this.toast.success({
  title: 'Success toast',
  description: 'Success toast message'
}); 
```

#### Warning
```jsx
this.toast.warning({
  title: 'Warning toast',
  description: 'Warning toast message'
}); 
```

#### Error
```jsx
this.toast.error({
  title: 'Error toast',
  description: 'Error toast message'
});  
```

#### Action
```jsx
this.toast.action({
  title: 'Action toast',
  description: 'Action toast message',
  button: {
    title: 'View Details',
    onClick: () => console.log('show')
  },
});  
```

#### Promise
```jsx
this.toast.promise(
  fetchData(),
  {
    loading: {
      title: 'Loading...',
    },
    success: (data) => ({
      title: 'Complete',
      description: 'promise complete message'
    }),
    error: (err) => ({
      title: 'Error',
      description: err.message
    })
  }
); 
```

#### Component in description without data
```jsx
this.toast.promise(
  fetchData(),
  {
    loading: {
      title: 'Loading...',
    },
    success: (data) => ({
      title: 'Complete',
      description: DataComponent
    }),
    error: (err) => ({
      title: 'Error',
      description: err.message
    })
  }
); 
```

#### Component in description with share data
```jsx
this.toast.promise(
  fetchData(),
  {
    loading: {
      title: 'Loading...',
    },
    success: (data) => ({
      title: 'Complete',
      description: {
        component: DataComponent,
        inputs: {
          data: data
        }
      }
    }),
    error: (err) => ({
      title: 'Error',
      description: err.message
    })
  }
); 

export class DataComponent {
  @Input() data!: any;
}
```

## Documentation

Find the full documentation on [official documentation](https://danieljimenezc.github.io/makki-toast/#/docs)
