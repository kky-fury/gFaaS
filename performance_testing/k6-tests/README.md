# Performance Testing

For Performance-Testing the Load-Testing-Tool [K6](https://k6.io) is used.
Due to network restrictions like DOS protection and other , the scripts are executed on the servers which run the Functions. 


### [Install K6](https://k6.io/docs/get-started/installation/)

```
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

### Scripts

#### Generate Tests

- Run ```generate_k6_tests.py``` to generate tests for functions of the provided language. Change input csv to the desired language.

#### Run tests

- Then execute the generated test via bash. Summaries are stored in ```results``` and ```results_cold_start```

#### Plot

- Then run ```plot.py``` to generate plots for either cold or hot starts
