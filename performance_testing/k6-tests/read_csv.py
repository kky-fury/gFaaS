import csv

def read_csv(csv_file):
    rows = []
    with open(csv_file, newline='') as csvfile:
        spamreader = csv.reader(csvfile, delimiter=',', quotechar='|')
        for row in spamreader:
            rows.append(row)
    return rows