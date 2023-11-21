import os
import subprocess
import shutil

from read_csv import read_csv


def create_script(row, duration, vus, iteration):
    target_test = prepare_test(row[0], row[1], row[2], row[3])
    output_file = './results/' + row[2] +  '/' + row[0] + '_' + row[1] + '_' + row[2] + '_' + str(iteration) + '.json'
    command = '/usr/local/bin/k6 run -u  ' + vus + ' -d ' + duration +  ' --address="" --summary-export ' + output_file + ' ' + target_test + '\n'
    with open('run_tests_' + row[0] + '_' + row[1] + '_' + row[2]  +'.sh', 'a') as file:
        file.write(command)


def inplace_change(filename, old_string, new_string):
    # Safely read the input filename using 'with'
    with open(filename) as f:
        s = f.read()
        if old_string not in s:
            return

    # Safely write the changed content, if found in the file
    with open(filename, 'w') as f:
        s = s.replace(old_string, new_string)
        f.write(s)


def prepare_test(function_name, platform, language,  url):
    if not os.path.isdir('./tmp'):
        os.mkdir('./tmp')

    target_test = './tmp/' + platform + '_' + language + '_' + function_name + '.js'
    shutil.copy('load-test.js', target_test)

    inplace_change(target_test, 'FUNCTION_NAME', function_name)
    inplace_change(target_test, 'URL', url)
    return target_test






if __name__ == '__main__':

    duration = '5m'
    vus = '100'

    iterations = 5

    rows = read_csv('python-functions.csv')

    for row in rows:
        print(row)
        for i in range(iterations):
            create_script(row, duration, vus, i)

    # for x in range(iterations):
    #     rows = read_csv('go-functions.csv')
    #     Clear shell script
        # with open('run_tests.sh', 'w') as file:
        #     file.write('#!/bin/zsh \n')
        # for row in rows:
        #     create_script(row, duration, vus, x)
        # subprocess.run(['/bin/bash', './run_tests.sh'])


