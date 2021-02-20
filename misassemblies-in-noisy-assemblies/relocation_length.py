#!/usr/bin/env python3

import pandas as pd 
import numpy as np 
import seaborn as sns 
import matplotlib.pyplot as plt

d = pd.read_csv("relocation_length.csv")
d["loglen"] = np.log(d["abslen"])

a4_dims = (11.7, 8.27)
fig, ax = plt.subplots(figsize=a4_dims)

sns.swarmplot(ax=ax, y="species", x="loglen", hue="positive", palette="Set2", data=d, dodge=True, size=1.3)

ax.legend_.remove()
ax.set_frame_on(False)
ax.set_xlabel('')
ax.set_ylabel('')
ax.set_xticks([])

plt.savefig("relocation_length.svg", dpi=40)
