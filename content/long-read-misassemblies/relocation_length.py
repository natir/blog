#!/usr/bin/env python3

import pandas as pd 
import numpy as np 
import seaborn as sns 
import matplotlib.pyplot as plt

d = pd.read_csv("relocation_length.csv")
d["loglen"] = np.log(d["abslen"])

ax = sns.violinplot(y="species", x="loglen", hue="positive", palette="Set2", data=d, split=True, bw=0.1, scale="count", linewidth=1);

plt.savefig("relocation_length.svg", dpi=400)
