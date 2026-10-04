# Dzen

Static storefront for the Dzen project.

## Commerce flow

The current checkout is client-side: the cart is stored in `localStorage` and a completed order draft is stored in `sessionStorage`. No customer data is transmitted. Connect an order API, verified seller details, and a working support channel before accepting real orders.

## Local preview

Run a static file server from the repository root, for example:

```bash
python3 -m http.server 4173
```
