+++
template = "page.html"
title = "Uncorrected long-read misassemblies"
date = 2019-08-23
draft = true
tags = ["long-read", "assembly", "evaluation"]
+++

We have many technics to evaluate the quality of assembly:
- wih only assembly information, N50, read remapping, probability of this reads come from this assembly
- by use external information: 
  + BUSCO
  + syntheny match
  + quast to near genome
  + quast to reference genome

// TODO add citation and detail tools name
  
  
We can use quast to reference genome, when we have a reference genome, so why we want preform an assembly.

The only case where we perform something like that was when we want evaluate differente assembly pipeline on same read data set. To evaluate a complete new assembly pipeline, test different set of parameter, evaluate the impact of add or change a tools in an assembly pipeline.



## Quast misassemblies definition

## Dataset, assembly pipeline and quast option

## Effect of increase size of breakpoint on quast evaluation tools

{{ plotly(id="nb_breakpoint", src="nb_breakpoint.js") }}

## Misassemblies are misassemblies ?



## Conclusion

I think misassemblies Quast metrics was good, for long reads uncorrected assemblies maybe the name isn't the good one, large unalignement was a better name ? Finaly it's still an assemblies evaluation metrics if you reduce the *# misassemblies* number you improve your assemblies.

But it's a good think to check the size of breakpoint generate misassemblies to be sure, you didn't reduce the number of short misassemblies to increase the number of large misassemblies.
