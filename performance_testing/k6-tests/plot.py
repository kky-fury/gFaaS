import json

import matplotlib
import matplotlib.pyplot as plt
import numpy as np

from read_csv import read_csv



def autolabel(rects, ax, xpos='center'):
    """
    Attach a text label above each bar in *rects*, displaying its height.

    *xpos* indicates which side to place the text w.r.t. the center of
    the bar. It can be one of the following {'center', 'right', 'left'}.
    """

    ha = {'center': 'center', 'right': 'left', 'left': 'right'}
    offset = {'center': 0, 'right': 1, 'left': -1}

    for rect in rects:
        height = rect.get_height()
        ax.annotate('{}'.format(height),
                    xy=(rect.get_x() + rect.get_width() / 2, height),
                    xytext=(offset[xpos]*3, 3),  # use 3 points offset
                    textcoords="offset points",  # in both directions
                    ha=ha[xpos], va='bottom', size=16, weight="bold")


def plot_load_tests():
    language = 'node'
    rows = read_csv(language + '-functions.csv')

    gfaas_means = []
    gfaas_std = []
    reference_means = []
    reference_std = []
    iterations = 5

    vus = '0'
    test_duration = '0s'
    total_test = str(iterations)

    for row in rows:


        avgs = []
        function_name = row[0]
        platform = row[1]
        language = row[2]
        for x in range(iterations):
            file_name = './results/' + language + '/' + function_name + '_' + platform + '_' + language + '_' + str(x) + '.json'
            f = open(file_name)
            data = json.load(f)
            print(data['metrics']['http_req_duration']['avg'])
            avgs.append(data['metrics']['http_req_duration']['avg'])
            vus = data['metrics']['vus']['value']
            test_duration = round(data['metrics']['iterations']['count'] / data['metrics']['iterations']['rate'], 0)
        print(function_name + '_' + platform + '_' + language + ':')
        average = round(np.average(avgs), 2)
        std = round(np.std(avgs), 2)
        print('Average: ' + str(average))
        print('Std: ' + str(std))
        print('------------------------------------------------------------')
        if function_name.startswith('gfaas'):
            gfaas_means.append(average)
            gfaas_std.append(std)
        else:
            reference_means.append(average)
            reference_std.append(std)

    gfaas_means_tuple = tuple(gfaas_means)
    gfaas_std_tuple = tuple(gfaas_std)

    reference_means_tuple = tuple(reference_means)
    reference_std_tuple = tuple(reference_std)

    print('gFaaS Means: ' + str(gfaas_means_tuple))
    print('gFaaS Std: ' + str(gfaas_std_tuple))
    print('Reference Means: ' + str(reference_means_tuple))
    print('Reference Std: ' + str(reference_std_tuple))

    # --------------- Plot -------------------


    ind = np.arange(len(gfaas_means_tuple))  # the x locations for the groups
    width = 0.3  # the width of the bars

    fig, ax = plt.subplots(figsize=(12,7))
    rects1 = ax.bar(ind - width / 2, gfaas_means_tuple, width, yerr=gfaas_std_tuple,
                    label='gFaaS Function', ecolor='#4286f5', edgecolor='#4286f5', color='w', hatch='++')
    rects2 = ax.bar(ind + width / 2, reference_means_tuple, width, yerr=reference_std_tuple,
                    label='Native Function', ecolor='#d9660b', edgecolor='#d9660b', color='w', hatch='//')




    # Add some text for labels, title and custom x-axis tick labels, etc.
    ax.set_ylabel('Average HTTP request duration [ms]', size=23.0)
    ax.set_xlabel('FaaS Platforms', size=23.0)
    # ax.set_title(display_language + '\nvus: ' + str(vus) + ', single test duration: ' + str(test_duration) + ' s, total tests:  '+ str(iterations) + '')
    ax.set_xticks(ind)
    ax.set_xticklabels(('OpenFaaS', 'Knative', 'Fission', 'Nuclio'))
    ax.legend(prop={'size': 20}, loc='upper left', ncol=2)

    # ax.grid(axis="both", color="0.5", linestyle='-', linewidth=0.5)
    # ax.set_axisbelow(True)

    ax.tick_params(axis='both', labelsize = 21.0)
    autolabel(rects1, ax, "left")
    autolabel(rects2, ax, "right")

    ax.set_ylim([0, 200])
    fig.tight_layout()


    # plt.show()
    fig.savefig(language + '-performance-new.pdf',bbox_inches = 'tight',pad_inches = 0,  dpi=300)
    # plt.savefig(language + '-performance.pdf')

def r(n):
    return round(n / 1000, 2)

def plot_cold_starts():
    language = 'python'
    language_label = 'Python'
    max_height_plot = 6.5
    platforms = ['knative', 'fission']
    images = ['cross-' + language, 'gfaas-' + language]
    iterations = 5

    gfaas_means = []
    gfaas_std = []
    reference_means = []
    reference_std = []

    for platform in platforms:
        for image in images:
            avgs = []
            for iteration in range(iterations):
                base_file = image + '_' + platform + '_' + language
                summary = base_file + '_' + str(iteration) + '.json'
                f = open('./results_cold_start/' + language + '/' + summary)
                data = json.load(f)
                avgs.append(data['metrics']['http_req_duration']['avg'])
            average = round(np.average(avgs), 2)
            std = round(np.std(avgs), 2)
            print(image + '_' + platform)
            print(avgs)
            print('Avg: ' + str(average))
            print('Std: ' + str(std))
            print('------------------------------------------------------------')
            if image.startswith('gfaas'):
                gfaas_means.append(average)
                gfaas_std.append(std)
            else:
                reference_means.append(average)
                reference_std.append(std)

    gfaas_means = map(r, gfaas_means)
    gfaas_std = map(r, gfaas_std)
    gfaas_means_tuple = tuple(gfaas_means)
    gfaas_std_tuple = tuple(gfaas_std)


    reference_means = map(r, reference_means)
    reference_std = map(r, reference_std)
    reference_means_tuple = tuple(reference_means)
    reference_std_tuple = tuple(reference_std)

    # --------------- Plot -------------------

    ind = np.arange(len(gfaas_means_tuple))  # the x locations for the groups
    width = 0.3  # the width of the bars

    fig, ax = plt.subplots(figsize=(10,7))
    rects1 = ax.bar(ind - width / 2, gfaas_means_tuple, width, yerr=gfaas_std_tuple,
                    label='gFaaS Function', ecolor='#4286f5', edgecolor='#4286f5', color='w', hatch='++')
    rects2 = ax.bar(ind + width / 2, reference_means_tuple, width, yerr=reference_std_tuple,
                    label='Native Function', ecolor='#d9660b', edgecolor='#d9660b', color='w', hatch='//')

    # Add some text for labels, title and custom x-axis tick labels, etc.
    ax.set_ylabel('HTTP request duration [s]', size=28.0)
    ax.set_xlabel('FaaS Platforms', size=28.0)
    # ax.set_title(language_label + '\ntotal tests: ' + str(iterations))
    ax.set_xticks(ind)
    ax.set_xticklabels(('Knative', 'Fission'))
    ax.legend(prop={'size': 20}, loc='upper left', ncol=2)

    # ax.grid(axis="both", color="0.5", linestyle='-', linewidth=0.5)
    # ax.set_axisbelow(True)

    ax.tick_params(axis='both', labelsize = 24.0)
    autolabel(rects1, ax, "left")
    autolabel(rects2, ax, "right")

    ax.set_ylim([0, max_height_plot])
    fig.tight_layout()

    # plt.show()
    # plt.savefig(language + '-cold-start-performance-new.pdf')
    fig.savefig(language + '-cold-start-performance-new.pdf',bbox_inches = 'tight',pad_inches = 0,  dpi=300)
if __name__ == '__main__':
    # plot_cold_starts()
    plot_load_tests()