output "instances" {
  value = data.null_data_source.instances[*].outputs
}
