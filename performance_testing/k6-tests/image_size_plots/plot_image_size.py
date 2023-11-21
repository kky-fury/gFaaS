import os
import datetime
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from pylab import rcParams
import glob
from scipy.stats.mstats import gmean



languages = ["Python", "Java", "Nodejs", "Go", "C++"]
gfass_function_sizes = [135, 425, 132, 15, 1130]
openfaas_function_sizes = [95, 269, 144, 17, 0]
knative_function_sizes = [135, 91, 144, 15, 0]



plt.rc('font', weight='normal')
fig, ax = plt.subplots(figsize=(15,7))

x = np.arange(len(languages))
width = 0.3


# threads_ow = ax.bar(x - width * 0.5, ow_threads, width, label='OW', color='#008571', hatch='xx')
image_size_gfaas = ax.bar(x - width * 1, gfass_function_sizes, width, label='gFaaS', ecolor='#4286f5', edgecolor='#4286f5', color='w', hatch='++')
image_size_openfaas = ax.bar(x + width * 0, openfaas_function_sizes, width, label='OpenFaaS', ecolor='#d9660b', edgecolor='#d9660b', color='w', hatch='//')
image_size_knative = ax.bar(x + width * 1, knative_function_sizes, width, label='Knative/Nuclio/Fission', ecolor='#aecbfa', edgecolor='#aecbfa', color='w', hatch='oo')

ax.set_ylabel('Function Image Size (MiB)', size=28.0)
ax.set_xlabel('Programming Language Runtimes', size=28.0)
#ax.set_title('Available Threads per service by Memory Configuration')
ax.set_xticks(x)
ax.set_xticklabels(languages)
ax.legend(prop={'size': 20}, loc='upper left', ncol=3)

ax.bar_label(image_size_gfaas, padding=2, size=16, weight='bold')
ax.bar_label(image_size_openfaas, padding=2, size=16, weight='bold')
ax.bar_label(image_size_knative, padding=2, size=16, weight='bold')
ax.set_ylim([0, 1200])

fig.tight_layout()
ax.tick_params(axis='both', labelsize = 24.0)
# plt.show()
fig.savefig("Image_sizes.pdf",bbox_inches = 'tight',pad_inches = 0,  dpi=300)